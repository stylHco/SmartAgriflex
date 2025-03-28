using System.Threading.Tasks;
using BeekeepingMonitoring.SpaBackend.Features.Identity;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace BeekeepingMonitoring.SpaBackend.Helpers;

public class ApplicationSignInManager : SignInManager<ApplicationUser>
{
    public ApplicationSignInManager(
        UserManager<ApplicationUser> userManager,
        IHttpContextAccessor contextAccessor,
        IUserClaimsPrincipalFactory<ApplicationUser> claimsFactory,
        IOptions<IdentityOptions> optionsAccessor,
        ILogger<ApplicationSignInManager> logger,
        IAuthenticationSchemeProvider schemes,
        IUserConfirmation<ApplicationUser> confirmation
    ) : base(
        userManager,
        contextAccessor,
        claimsFactory,
        optionsAccessor,
        logger,
        schemes,
        confirmation
    )
    {
    }

    public override async Task SignOutAsync()
    {
        await Context.SignOutAsync(IdentityConstants.ApplicationScheme);
        
        // Don't have these schemes currently
        // await Context.SignOutAsync(IdentityConstants.ExternalScheme);
        // await Context.SignOutAsync(IdentityConstants.TwoFactorUserIdScheme);
    }
}