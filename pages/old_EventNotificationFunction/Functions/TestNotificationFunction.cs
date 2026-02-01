using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using EventNotificationFunction.Services;
using System.Net;

namespace EventNotificationFunction.Functions;

/// <summary>
/// HTTP endpoint for testing the notification logic without waiting for the timer
/// GET http://localhost:7071/api/test-notification
/// </summary>
public class TestNotificationFunction
{
    private readonly ILogger _logger;
    private readonly IConvocationTableService _tableService;
    private readonly INotificationEmailService _emailService;

    public TestNotificationFunction(
        ILoggerFactory loggerFactory,
        IConvocationTableService tableService,
        INotificationEmailService emailService)
    {
        _logger = loggerFactory.CreateLogger<TestNotificationFunction>();
        _tableService = tableService;
        _emailService = emailService;
    }

    [Function("TestNotification")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req)
    {
        _logger.LogInformation("🧪 Manual test triggered via HTTP");

        try
        {
            // Same logic as the Timer function
            _logger.LogInformation("📊 Fetching upcoming convocations...");
            var convocations = await _tableService.GetUpcomingConvocationsAsync();

            if (convocations == null || convocations.Count == 0)
            {
                _logger.LogInformation("ℹ️  No convocations found for the next 7 days");
                
                var emptyResponse = req.CreateResponse(HttpStatusCode.OK);
                await emptyResponse.WriteAsJsonAsync(new 
                { 
                    success = true, 
                    message = "No convocations found for the next 7 days",
                    count = 0 
                });
                return emptyResponse;
            }

            _logger.LogInformation($"✅ Found {convocations.Count} convocation(s)");

            _logger.LogInformation("📧 Sending notification email...");
            await _emailService.SendWeeklyNotificationAsync(convocations);

            _logger.LogInformation("✅ Test notification completed successfully");

            var response = req.CreateResponse(HttpStatusCode.OK);
            await response.WriteAsJsonAsync(new 
            { 
                success = true, 
                message = "Notification sent successfully",
                count = convocations.Count 
            });
            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error in test notification: {ex.Message}");
            
            var errorResponse = req.CreateResponse(HttpStatusCode.InternalServerError);
            await errorResponse.WriteAsJsonAsync(new 
            { 
                success = false, 
                error = ex.Message 
            });
            return errorResponse;
        }
    }
}
