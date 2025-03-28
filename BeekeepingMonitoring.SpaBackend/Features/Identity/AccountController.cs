using System;
using System.Threading.Tasks;
using BeekeepingMonitoring.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace BeekeepingMonitoring.SpaBackend.Features.Identity;

[ApiController]
[Route(RoutingHelpers.ApiRoutePrefix + "/account")]
[Authorize]
[AutoConstructor]
public partial class AccountController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    #region ChangePassword

    public class ChangePasswordModel
    {
        public string CurrentPassword { get; set; } = null!;
        public string NewPassword { get; set; } = null!;
    }

    [HttpPost("change-password")]
    public async Task<ActionResult<IdentityResult>> ChangePassword(ChangePasswordModel model)
    {
        ApplicationUser user = await GetApplicationUser();

        IdentityResult result = await _userManager.ChangePasswordAsync(
            user, model.CurrentPassword, model.NewPassword
        );

        if (result.Succeeded)
        {
            await _signInManager.RefreshSignInAsync(user);
        }

        return result;
    }

    #endregion

    #region Helpers

    private async Task<ApplicationUser> GetApplicationUser()
    {
        ApplicationUser? user = await _userManager.GetUserAsync(User);

        if (user == null)
        {
            throw new Exception("Failed to fetch the current user for changing the password");
        }

        return user;
    }

    #endregion
}