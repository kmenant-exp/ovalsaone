using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using EventNotificationFunction.Services;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices(services =>
    {
        services.AddScoped<IConvocationTableService, ConvocationTableService>();
        services.AddScoped<INotificationEmailService, NotificationEmailService>();
    })
    .Build();

host.Run();
