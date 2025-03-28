using System.Text.Json.Serialization;
using AutoMapper;
using AutoMapper.EquivalencyExpression;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NodaTime;
using NodaTime.Serialization.SystemTextJson;

namespace BeekeepingMonitoring.SpaBackend;

public static partial class Bootstrapper
{
    public static WebApplication BuildApp(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        ConfigureServices(builder);

        WebApplication app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.Services.GetRequiredService<IMapper>()
                .ConfigurationProvider
                .AssertConfigurationIsValid();
        }

        ConfigurePipeline(app);

        return app;
    }

    private static void ConfigureServices(WebApplicationBuilder builder)
    {
        ConfigureAuth(builder);
        ConfigureEmail(builder);
        ConfigureSwagger(builder);
        ConfigureDatabase(builder);

        IServiceCollection services = builder.Services;

        services.AddAutoMapper(
            config => { config.AddCollectionMappers(); },
            typeof(Bootstrapper).Assembly
        );

        services.AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.ConfigureForNodaTime(DateTimeZoneProviders.Tzdb);
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            });

        // In production, the Angular files will be served from this directory
        services.AddSpaStaticFiles(configuration => { configuration.RootPath = "ClientAppDist"; });
    }

    private static void ConfigurePipeline(WebApplication app)
    {
        if (app.Environment.IsDevelopment())
        {
            app.UseOpenApi();
            app.UseSwaggerUi();
        }

        app.UseHttpsRedirection();

        // Note: the position of this middleware is important.
        // 1) We want to avoid the auth/controllers pipeline when in the end we will just serve a static file
        // 2) UseSpa() causes a rewrite of the request to the index.html, which breaks serving of static assets
        if (!app.Environment.IsDevelopment())
        {
            app.UseSpaStaticFiles();
        }

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
    }
}