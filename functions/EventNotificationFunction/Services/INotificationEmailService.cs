using EventNotificationFunction.Models;

namespace EventNotificationFunction.Services;

public interface INotificationEmailService
{
    Task SendWeeklyNotificationAsync(List<ConvocationEntity> convocations);
}
