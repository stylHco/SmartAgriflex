using BeekeepingMonitoring.SpaBackend.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace BeekeepingMonitoring.SpaBackend;

public static partial class Bootstrapper
{
    private static void ConfigureDatabase(WebApplicationBuilder builder)
    {
        IServiceCollection services = builder.Services;

        services.AddDbContext<ApplicationDbContext>(contextBuilder =>
        {
            contextBuilder.UseSqlServer(
                builder.Configuration.GetConnectionString("DefaultConnection"),
                sqlServerBuilder => { sqlServerBuilder.UseNodaTime(); }
            );
        });

        if (builder.Environment.IsDevelopment())
        {
            services.AddDatabaseDeveloperPageExceptionFilter();
        }
    }
}