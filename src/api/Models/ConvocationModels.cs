using System.ComponentModel.DataAnnotations;
using Azure;
using Azure.Data.Tables;

namespace RugbyClubApi.Models;

/// <summary>
/// Statut de réponse à une convocation
/// </summary>
public enum ConvocationStatus
{
    Present,
    Absent,
    Incertain
}

/// <summary>
/// Modèle de formulaire pour répondre à une convocation
/// </summary>
public class ConvocationFormModel
{
    [Required(ErrorMessage = "L'identifiant de l'événement est requis")]
    public string EventId { get; set; } = string.Empty;

    [Required(ErrorMessage = "La date de l'événement est requise")]
    public string EventDate { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom de l'événement est requis")]
    public string EventName { get; set; } = string.Empty;

    [Required(ErrorMessage = "L'équipe est requise")]
    public string Equipe { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le prénom est requis")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Le prénom doit contenir entre 2 et 50 caractères")]
    public string Prenom { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom est requis")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Le nom doit contenir entre 2 et 50 caractères")]
    public string Nom { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le statut est requis")]
    public ConvocationStatus Statut { get; set; }

    public bool BesoinCovoiturage { get; set; }

    [Range(0, 8, ErrorMessage = "Le nombre de places doit être entre 0 et 8")]
    public int PlacesProposees { get; set; }
}

/// <summary>
/// Entité stockée dans Azure Table Storage
/// </summary>
public class ConvocationEntity : ITableEntity
{
    // PartitionKey: EventId (format: equipe_eventDate_eventName)
    // RowKey: Nom_Prenom (identifiant unique du joueur)
    
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Informations sur l'événement
    public string EventName { get; set; } = string.Empty;
    public string EventDate { get; set; } = string.Empty;
    public string Equipe { get; set; } = string.Empty;

    // Informations du joueur
    public string Prenom { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;

    // Réponse
    public string Statut { get; set; } = string.Empty;
    public bool BesoinCovoiturage { get; set; }
    public int PlacesProposees { get; set; }
    
    public DateTimeOffset DateReponse { get; set; }
    public DateTimeOffset? DateModification { get; set; }
}

/// <summary>
/// Modèle de réponse pour afficher une convocation
/// </summary>
public class ConvocationResponseModel
{
    public string EventId { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string Equipe { get; set; } = string.Empty;
    public ConvocationStatus Statut { get; set; }
    public bool BesoinCovoiturage { get; set; }
    public int PlacesProposees { get; set; }
    public DateTimeOffset DateReponse { get; set; }
}

/// <summary>
/// Résumé des réponses pour un événement
/// </summary>
public class ConvocationSummary
{
    public string EventId { get; set; } = string.Empty;
    public int TotalPresents { get; set; }
    public int TotalAbsents { get; set; }
    public int TotalIncertains { get; set; }
    public int TotalReponses => TotalPresents + TotalAbsents + TotalIncertains;
    public int TotalBesoinCovoiturage { get; set; }
    public int TotalPlacesDisponibles { get; set; }
    public List<ConvocationResponseModel> Reponses { get; set; } = new();
}

/// <summary>
/// Requête pour obtenir les convocations d'un événement
/// </summary>
public class GetConvocationsRequest
{
    [Required]
    public string EventId { get; set; } = string.Empty;
}
