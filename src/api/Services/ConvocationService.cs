using Azure;
using Azure.Data.Tables;
using Microsoft.Extensions.Logging;
using RugbyClubApi.Models;

namespace RugbyClubApi.Services;

public interface IConvocationService
{
    Task<ConvocationEntity> SaveConvocationAsync(ConvocationFormModel form);
    Task<ConvocationSummary> GetConvocationSummaryAsync(string eventId);
    Task<ConvocationEntity?> GetExistingResponseAsync(string eventId, string nom, string prenom);
}

public class ConvocationService : IConvocationService
{
    private readonly ILogger<ConvocationService> _logger;
    private readonly TableClient? _tableClient;
    private const string TableName = "Convocations";

    public ConvocationService(ILogger<ConvocationService> logger)
    {
        _logger = logger;

        var connectionString = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING");
        
        if (!string.IsNullOrEmpty(connectionString))
        {
            try
            {
                var tableServiceClient = new TableServiceClient(connectionString);
                tableServiceClient.CreateTableIfNotExists(TableName);
                _tableClient = tableServiceClient.GetTableClient(TableName);
                _logger.LogInformation("Azure Table Storage connecté avec succès");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Impossible de se connecter à Azure Table Storage");
                _tableClient = null;
            }
        }
        else
        {
            _logger.LogWarning("AZURE_STORAGE_CONNECTION_STRING non configuré - mode simulation activé");
            _tableClient = null;
        }
    }

    /// <summary>
    /// Génère une clé de partition pour l'événement
    /// </summary>
    private static string GeneratePartitionKey(string eventId)
    {
        // Nettoie l'eventId pour être compatible avec Azure Table Storage
        return eventId.Replace("/", "_").Replace("\\", "_");
    }

    /// <summary>
    /// Génère une clé de ligne unique pour la réponse
    /// </summary>
    private static string GenerateRowKey(string nom, string prenom)
    {
        // Combinaison nom + prénom pour identifier le joueur
        var combined = $"{nom}_{prenom}".ToLowerInvariant();
        return combined.Replace(" ", "_").Replace("'", "_");
    }

    public async Task<ConvocationEntity> SaveConvocationAsync(ConvocationFormModel form)
    {
        var entity = new ConvocationEntity
        {
            PartitionKey = GeneratePartitionKey(form.EventId),
            RowKey = GenerateRowKey(form.Nom, form.Prenom),
            EventName = form.EventName,
            EventDate = form.EventDate,
            Equipe = form.Equipe,
            Prenom = form.Prenom,
            Nom = form.Nom.ToUpper(),
            Statut = form.Statut.ToString(),
            BesoinCovoiturage = form.BesoinCovoiturage,
            PlacesProposees = form.PlacesProposees,
            DateReponse = DateTimeOffset.UtcNow
        };

        if (_tableClient != null)
        {
            // Vérifie si une réponse existe déjà
            var existingResponse = await GetExistingResponseAsync(form.EventId, form.Nom, form.Prenom);
            
            if (existingResponse != null)
            {
                // Mise à jour
                entity.DateReponse = existingResponse.DateReponse;
                entity.DateModification = DateTimeOffset.UtcNow;
                entity.ETag = existingResponse.ETag;
                
                await _tableClient.UpdateEntityAsync(entity, entity.ETag, TableUpdateMode.Replace);
                _logger.LogInformation($"Convocation mise à jour pour {form.Prenom} {form.Nom}");
            }
            else
            {
                // Nouvelle entrée
                await _tableClient.AddEntityAsync(entity);
                _logger.LogInformation($"Nouvelle convocation enregistrée pour {form.Prenom} {form.Nom}");
            }
        }
        else
        {
            // Mode simulation - log seulement
            _logger.LogInformation($"[SIMULATION] Convocation pour {form.Prenom} {form.Nom}:");
            _logger.LogInformation($"  Événement: {form.EventName} ({form.EventDate})");
            _logger.LogInformation($"  Équipe: {form.Equipe}");
            _logger.LogInformation($"  Statut: {form.Statut}");
            _logger.LogInformation($"  Besoin covoiturage: {(form.BesoinCovoiturage ? "Oui" : "Non")}");
            _logger.LogInformation($"  Places proposées: {form.PlacesProposees}");
        }

        return entity;
    }

    public async Task<ConvocationSummary> GetConvocationSummaryAsync(string eventId)
    {
        var summary = new ConvocationSummary
        {
            EventId = eventId
        };

        if (_tableClient == null)
        {
            _logger.LogWarning("[SIMULATION] Récupération du résumé des convocations - retourne un résumé vide");
            return summary;
        }

        var partitionKey = GeneratePartitionKey(eventId);

        try
        {
            await foreach (var entity in _tableClient.QueryAsync<ConvocationEntity>(e => e.PartitionKey == partitionKey))
            {
                var status = Enum.Parse<ConvocationStatus>(entity.Statut);
                
                switch (status)
                {
                    case ConvocationStatus.Present:
                        summary.TotalPresents++;
                        break;
                    case ConvocationStatus.Absent:
                        summary.TotalAbsents++;
                        break;
                    case ConvocationStatus.Incertain:
                        summary.TotalIncertains++;
                        break;
                }

                if (entity.BesoinCovoiturage)
                {
                    summary.TotalBesoinCovoiturage++;
                }
                summary.TotalPlacesDisponibles += entity.PlacesProposees;

                summary.Reponses.Add(new ConvocationResponseModel
                {
                    EventId = eventId,
                    Prenom = entity.Prenom,
                    Nom = entity.Nom,
                    Equipe = entity.Equipe,
                    Statut = status,
                    BesoinCovoiturage = entity.BesoinCovoiturage,
                    PlacesProposees = entity.PlacesProposees,
                    DateReponse = entity.DateReponse
                });
            }

            _logger.LogInformation($"Résumé des convocations pour {eventId}: {summary.TotalReponses} réponses");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Erreur lors de la récupération des convocations pour {eventId}");
        }

        return summary;
    }

    public async Task<ConvocationEntity?> GetExistingResponseAsync(string eventId, string nom, string prenom)
    {
        if (_tableClient == null)
        {
            return null;
        }

        var partitionKey = GeneratePartitionKey(eventId);
        var rowKey = GenerateRowKey(nom, prenom);

        try
        {
            var response = await _tableClient.GetEntityAsync<ConvocationEntity>(partitionKey, rowKey);
            return response.Value;
        }
        catch (RequestFailedException ex) when (ex.Status == 404)
        {
            return null;
        }
    }
}
