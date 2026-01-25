using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using RugbyClubApi.Models;
using RugbyClubApi.Services;

namespace RugbyClubApi.Functions;

public class ConvocationFunction
{
    private readonly ILogger _logger;
    private readonly IConvocationService _convocationService;
    private static readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
    };

    public ConvocationFunction(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<ConvocationFunction>();
        _convocationService = new ConvocationService(loggerFactory.CreateLogger<ConvocationService>());
    }

    /// <summary>
    /// Endpoint pour soumettre une réponse à une convocation
    /// POST /api/convocation
    /// </summary>
    [Function("Convocation")]
    public async Task<HttpResponseData> SubmitConvocation(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options")] HttpRequestData req)
    {
        _logger.LogInformation("Traitement d'une réponse à une convocation");

        // Gestion CORS pour OPTIONS
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return CreateCorsResponse(req);
        }

        try
        {
            // Lire le contenu de la requête
            var requestBody = await new StreamReader(req.Body).ReadToEndAsync();

            if (string.IsNullOrEmpty(requestBody))
            {
                return await CreateErrorResponse(req, "Corps de la requête vide", HttpStatusCode.BadRequest);
            }

            // Désérialiser les données
            var convocationForm = JsonSerializer.Deserialize<ConvocationFormModel>(requestBody, _jsonOptions);

            if (convocationForm == null)
            {
                return await CreateErrorResponse(req, "Données invalides", HttpStatusCode.BadRequest);
            }

            // Validation des données
            var validationResults = new List<ValidationResult>();
            var validationContext = new ValidationContext(convocationForm);

            if (!Validator.TryValidateObject(convocationForm, validationContext, validationResults, true))
            {
                var errors = validationResults.Select(vr => vr.ErrorMessage ?? "Erreur de validation").ToList();
                return await CreateValidationErrorResponse(req, "Données invalides", errors);
            }

            // Enregistrer la convocation
            var savedEntity = await _convocationService.SaveConvocationAsync(convocationForm);

            _logger.LogInformation($"Convocation enregistrée pour {convocationForm.Prenom} {convocationForm.Nom} - Événement: {convocationForm.EventName}");

            // Créer la réponse de succès
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            AddCorsHeaders(response);

            var statusText = convocationForm.Statut switch
            {
                ConvocationStatus.Present => "présent(e)",
                ConvocationStatus.Absent => "absent(e)",
                ConvocationStatus.Incertain => "incertain(e)",
                _ => convocationForm.Statut.ToString()
            };

            var successResponse = new ApiResponse<object>
            {
                Success = true,
                Message = $"Votre réponse a été enregistrée. {convocationForm.Prenom} {convocationForm.Nom} est marqué(e) comme {statusText}.",
                Data = new
                {
                    eventId = convocationForm.EventId,
                    prenom = convocationForm.Prenom,
                    nom = convocationForm.Nom,
                    statut = convocationForm.Statut.ToString()
                }
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(successResponse, _jsonOptions));
            return response;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Erreur de désérialisation JSON");
            return await CreateErrorResponse(req, "Format JSON invalide", HttpStatusCode.BadRequest);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors du traitement de la convocation");
            return await CreateErrorResponse(req, "Une erreur s'est produite lors de l'enregistrement de votre réponse", HttpStatusCode.InternalServerError);
        }
    }

    /// <summary>
    /// Endpoint pour récupérer le résumé des convocations d'un événement
    /// GET /api/convocation-summary?eventId=xxx
    /// </summary>
    [Function("ConvocationSummary")]
    public async Task<HttpResponseData> GetConvocationSummary(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "options")] HttpRequestData req)
    {
        _logger.LogInformation("Récupération du résumé des convocations");

        // Gestion CORS pour OPTIONS
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return CreateCorsResponse(req);
        }

        try
        {
            // Récupérer l'eventId depuis les query params
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var eventId = query["eventId"];

            if (string.IsNullOrEmpty(eventId))
            {
                return await CreateErrorResponse(req, "L'identifiant de l'événement est requis", HttpStatusCode.BadRequest);
            }

            // Récupérer le résumé
            var summary = await _convocationService.GetConvocationSummaryAsync(eventId);

            // Créer la réponse
            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            AddCorsHeaders(response);

            var successResponse = new ApiResponse<ConvocationSummary>
            {
                Success = true,
                Data = summary
            };

            await response.WriteStringAsync(JsonSerializer.Serialize(successResponse, _jsonOptions));

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la récupération du résumé des convocations");
            return await CreateErrorResponse(req, "Une erreur s'est produite", HttpStatusCode.InternalServerError);
        }
    }

    /// <summary>
    /// Endpoint pour vérifier si une réponse existe déjà
    /// GET /api/convocation-check?eventId=xxx&nom=xxx&prenom=xxx
    /// </summary>
    [Function("ConvocationCheck")]
    public async Task<HttpResponseData> CheckExistingResponse(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "options")] HttpRequestData req)
    {
        _logger.LogInformation("Vérification d'une réponse existante");

        // Gestion CORS pour OPTIONS
        if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
        {
            return CreateCorsResponse(req);
        }

        try
        {
            var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
            var eventId = query["eventId"];
            var nom = query["nom"];
            var prenom = query["prenom"];

            if (string.IsNullOrEmpty(eventId) || string.IsNullOrEmpty(nom) || string.IsNullOrEmpty(prenom))
            {
                return await CreateErrorResponse(req, "Paramètres manquants", HttpStatusCode.BadRequest);
            }

            var existingResponse = await _convocationService.GetExistingResponseAsync(eventId, nom, prenom);

            var response = req.CreateResponse(HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            AddCorsHeaders(response);

            if (existingResponse != null)
            {
                var successResponse = new ApiResponse<object>
                {
                    Success = true,
                    Data = new
                    {
                        exists = true,
                        statut = existingResponse.Statut,
                        besoinCovoiturage = existingResponse.BesoinCovoiturage,
                        placesProposees = existingResponse.PlacesProposees,
                        dateReponse = existingResponse.DateReponse
                    }
                };
                await response.WriteStringAsync(JsonSerializer.Serialize(successResponse, _jsonOptions));
            }
            else
            {
                var notFoundResponse = new ApiResponse<object>
                {
                    Success = true,
                    Data = new { exists = false }
                };
                await response.WriteStringAsync(JsonSerializer.Serialize(notFoundResponse, _jsonOptions));
            }

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erreur lors de la vérification de la réponse existante");
            return await CreateErrorResponse(req, "Une erreur s'est produite", HttpStatusCode.InternalServerError);
        }
    }

    private HttpResponseData CreateCorsResponse(HttpRequestData req)
    {
        var response = req.CreateResponse(HttpStatusCode.OK);
        AddCorsHeaders(response);
        response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        response.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
        return response;
    }

    private void AddCorsHeaders(HttpResponseData response)
    {
        response.Headers.Add("Access-Control-Allow-Origin", "*");
    }

    private async Task<HttpResponseData> CreateErrorResponse(HttpRequestData req, string message, HttpStatusCode statusCode)
    {
        var response = req.CreateResponse(statusCode);
        response.Headers.Add("Content-Type", "application/json");
        AddCorsHeaders(response);

        var errorResponse = new ApiResponse<object>
        {
            Success = false,
            Message = message
        };

        await response.WriteStringAsync(JsonSerializer.Serialize(errorResponse, _jsonOptions));
        return response;
    }

    private async Task<HttpResponseData> CreateValidationErrorResponse(HttpRequestData req, string message, List<string> errors)
    {
        var response = req.CreateResponse(HttpStatusCode.BadRequest);
        response.Headers.Add("Content-Type", "application/json");
        AddCorsHeaders(response);

        var errorResponse = new ApiResponse<object>
        {
            Success = false,
            Message = message,
            Data = new { errors }
        };

        await response.WriteStringAsync(JsonSerializer.Serialize(errorResponse, _jsonOptions));
        return response;
    }
}
