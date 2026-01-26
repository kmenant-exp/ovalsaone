using EventNotificationFunction.Models;

namespace EventNotificationFunction.Services;

public interface IConvocationTableService
{
    Task<List<ConvocationEntity>> GetUpcomingConvocationsAsync();
}
