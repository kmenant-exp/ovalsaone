using Azure.Data.Tables;
using EventNotificationFunction.Models;

namespace EventNotificationFunction.Services;

public class ConvocationTableService : IConvocationTableService
{
    private readonly string _connectionString;
    private readonly string _tableName = "Convocations";

    public ConvocationTableService()
    {
        _connectionString = Environment.GetEnvironmentVariable("AZURE_STORAGE_CONNECTION_STRING") ?? string.Empty;
    }

    public async Task<List<ConvocationEntity>> GetUpcomingConvocationsAsync()
    {
        if (string.IsNullOrWhiteSpace(_connectionString))
        {
            Console.WriteLine("⚠️  AZURE_STORAGE_CONNECTION_STRING not configured - returning empty list");
            return new List<ConvocationEntity>();
        }

        try
        {
            var serviceClient = new TableServiceClient(_connectionString);
            var tableClient = serviceClient.GetTableClient(_tableName);

            // Ensure table exists
            await tableClient.CreateIfNotExistsAsync();

            // Calculate date range (today + 7 days)
            var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
            var inSevenDays = DateTime.UtcNow.Date.AddDays(7).ToString("yyyy-MM-dd");

            // OData filter for next 7 days
            var filter = $"EventDate ge '{today}' and EventDate le '{inSevenDays}'";

            Console.WriteLine($"📊 Querying table '{_tableName}' with filter: {filter}");

            var convocations = new List<ConvocationEntity>();

            await foreach (var entity in tableClient.QueryAsync<ConvocationEntity>(filter))
            {
                convocations.Add(entity);
            }

            // Sort by EventDate, then Nom
            var sortedConvocations = convocations
                .OrderBy(c => c.EventDate)
                .ThenBy(c => c.Nom)
                .ToList();

            Console.WriteLine($"✅ Found {sortedConvocations.Count} convocation(s)");

            return sortedConvocations;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error querying Azure Table Storage: {ex.Message}");
            throw;
        }
    }
}
