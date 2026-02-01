using Azure;
using Azure.Data.Tables;

namespace EventNotificationFunction.Models;

public class ConvocationEntity : ITableEntity
{
    // ITableEntity properties
    public string PartitionKey { get; set; } = string.Empty;
    public string RowKey { get; set; } = string.Empty;
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }

    // Convocation properties
    public string EventName { get; set; } = string.Empty;
    public string EventDate { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string Statut { get; set; } = string.Empty;
    public bool BesoinCovoiturage { get; set; }
    public int PlacesProposees { get; set; }
}
