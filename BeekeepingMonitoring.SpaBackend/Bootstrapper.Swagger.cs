using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace BeekeepingMonitoring.SpaBackend;

public static partial class Bootstrapper
{
    private static void ConfigureSwagger(WebApplicationBuilder builder)
    {
        IServiceCollection services = builder.Services;

        if (builder.Environment.IsDevelopment())
        {
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            services.AddEndpointsApiExplorer();
            services.AddSwaggerDocument();
        }
    }
}