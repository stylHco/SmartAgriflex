using System;
using System.Threading.Tasks;
using BeekeepingMonitoring.SpaBackend.Data;
using BeekeepingMonitoring.SpaBackend.Features.Identity;
using BeekeepingMonitoring.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace BeekeepingMonitoring.SpaBackend;

public static partial class Bootstrapper
{
    private static void ConfigureAuth(WebApplicationBuilder builder)
    {
        IServiceCollection services = builder.Services;

        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.SignIn.RequireConfirmedAccount = true;

                // Simplify the requirements for dev/testing/demo
                options.Password.RequiredLength = 2;
                options.Password.RequireUppercase = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireDigit = false;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddSignInManager()
            .AddDefaultTokenProviders()
            .AddEntityFrameworkStores<ApplicationDbContext>();

        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = IdentityConstants.ApplicationScheme;
                options.DefaultChallengeScheme = IdentityConstants.ApplicationScheme;
                // options.DefaultSignInScheme = IdentityConstants.ExternalScheme;
            })
            .AddCookie(IdentityConstants.ApplicationScheme, options =>
            {
                options.LoginPath = "/auth/login";
                options.Events.OnValidatePrincipal = SecurityStampValidator.ValidatePrincipalAsync;

                static Func<RedirectContext<CookieAuthenticationOptions>, Task> HandleApiRequest(
                    int statusCode,
                    Func<RedirectContext<CookieAuthenticationOptions>, Task> original
                )
                {
                    return redirectContext =>
                    {
                        if (redirectContext.HttpContext.IsApiRequest())
                        {
                            redirectContext.Response.StatusCode = statusCode;
                            return Task.CompletedTask;
                        }

                        // TODO: Add a parameter to force a full page reload
                        // instead of internal angular router navigation
                        return original(redirectContext);
                    };
                }

                options.Events.OnRedirectToLogin = HandleApiRequest(
                    StatusCodes.Status401Unauthorized, options.Events.OnRedirectToLogin
                );
                options.Events.OnRedirectToAccessDenied = HandleApiRequest(
                    StatusCodes.Status403Forbidden, options.Events.OnRedirectToAccessDenied
                );
            });

        services.AddScoped<SignInManager<ApplicationUser>, ApplicationSignInManager>();
    }
}