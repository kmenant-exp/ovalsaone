using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using EventNotificationFunction.Services;

namespace EventNotificationFunction.Functions;

public class WeeklyNotificationFunction
{
    private readonly ILogger _logger;
    private readonly IConvocationTableService _tableService;
    private readonly INotificationEmailService _emailService;

    public WeeklyNotificationFunction(
        ILoggerFactory loggerFactory,
        IConvocationTableService tableService,
        INotificationEmailService emailService)
    {
        _logger = loggerFactory.CreateLogger<WeeklyNotificationFunction>();
        _tableService = tableService;
        _emailService = emailService;
    }

    /// <summary>
    /// Timer trigger function that runs every Thursday at 8:00 AM
    /// CRON expression: "0 0 8 * * 4" (seconds, minutes, hours, day, month, day-of-week)
    /// Day 4 = Thursday (0=Sunday, 1=Monday, ..., 6=Saturday)
    /// </summary>
    [Function("WeeklyNotification")]
    public async Task Run([TimerTrigger("0 0 8 * * 4")] TimerInfo myTimer)
    {
        _logger.LogInformation($"🕒 Weekly notification function executed at: {DateTime.Now}");

        if (myTimer.ScheduleStatus is not null)
        {
            _logger.LogInformation($"Next timer schedule at: {myTimer.ScheduleStatus.Next}");
        }

        try
        {
            // Step 1: Query upcoming convocations from Azure Table Storage
            _logger.LogInformation("📊 Fetching upcoming convocations...");
            var convocations = await _tableService.GetUpcomingConvocationsAsync();

            if (convocations == null || convocations.Count == 0)
            {
                _logger.LogInformation("ℹ️  No convocations found for the next 7 days - skipping email");
                return;
            }

            _logger.LogInformation($"✅ Found {convocations.Count} convocation(s)");

            // Step 2: Generate HTML and send email
            _logger.LogInformation("📧 Sending notification email...");
            await _emailService.SendWeeklyNotificationAsync(convocations);

            _logger.LogInformation("✅ Weekly notification completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError($"❌ Error in weekly notification: {ex.Message}");
            _logger.LogError(ex.StackTrace);
            throw;
        }
    }
}
