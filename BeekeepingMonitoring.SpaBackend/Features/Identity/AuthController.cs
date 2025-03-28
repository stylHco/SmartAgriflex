using System;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using BeekeepingMonitoring.SpaBackend.Features.Identity.Emails;
using BeekeepingMonitoring.SpaBackend.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using NJsonSchema.Annotations;
using SignInResult = Microsoft.AspNetCore.Identity.SignInResult;

namespace BeekeepingMonitoring.SpaBackend.Features.Identity;

[ApiController]
[Route(RoutingHelpers.ApiRoutePrefix + "/auth")]
[AutoConstructor]
public partial class AuthController : ControllerBase
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly ILogger<AuthController> _logger;
    private readonly IUserStore<ApplicationUser> _userStore;
    private readonly UserManager<ApplicationUser> _userManager;
    // private readonly IAuthMailer _authMailer;

    #region Status

    [HttpGet("status"), ResponseCache(NoStore = true)]
    public /*async Task<*/AuthStatus/*>*/ GetStatus()
    {
        if (!User.Identity!.IsAuthenticated)
        {
            return new AuthStatus
            {
                IsLoggedIn = false,
            };
        }

        // ApplicationUser user = await _userManager.GetUserAsync(User);
        return new AuthStatus
        {
            IsLoggedIn = true,
            User = new UserInfo
            {
                Email = User.FindFirstValue(ClaimTypes.Name) ?? throw new Exception("Missing Name claim for the user"),
            },
        };
    }

    public class AuthStatus
    {
        public bool IsLoggedIn { get; set; }
        public UserInfo? User { get; set; }
    }

    [JsonSchema(Name = "AuthenticatedUserInfo")]
    public class UserInfo
    {
        public string Email { get; set; } = null!;
        // public IEnumerable<UserRoleType> Roles { get; set; }
    }

    #endregion

    #region Login

    public class LoginModel
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
        public bool RememberMe { get; set; }
    }

    [HttpPost("login")]
    [ErrorIfAuthenticated]
    public async Task<ActionResult<SignInResult>> Login(LoginModel model)
    {
        // This doesn't count login failures towards account lockout
        // To enable password failures to trigger account lockout, set lockoutOnFailure: true
        SignInResult result = await _signInManager.PasswordSignInAsync(
            model.Username, model.Password, model.RememberMe,
            lockoutOnFailure: false
        );

        if (result.Succeeded)
        {
            _logger.LogInformation("User logged in");
        }

        return result;
    }

    #endregion

    #region Logout

    [HttpPost("logout")]
    [Authorize]
    public async Task<ActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        _logger.LogInformation("User logged out");

        return Ok();
    }

    #endregion

    #region Register

    public class RegisterModel
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    [HttpPost("register")]
    [ErrorIfAuthenticated]
    public async Task<ActionResult<IdentityResult>> Register(RegisterModel model)
    {
        ApplicationUser user = new()
        {
            Email = model.Email,
        };

        await _userStore.SetUserNameAsync(user, model.Email, CancellationToken.None);

        IdentityResult result = await _userManager.CreateAsync(user, model.Password);

        if (!result.Succeeded)
        {
            return Ok(result);
        }

        string callbackUrl = await GenerateConfirmEmailUrl(user);
        EmailConfirmPayload payload = new()
        {
            UserDisplayName = user.UserName!,
            UserEmail = user.Email,
            CallbackUrl = callbackUrl,
        };

        // Don't wait for the email to be sent
        // _ = Task.Run(async () =>
        // {
        //     try
        //     {
        //         await _authMailer.SendEmailConfirm(payload);
        //     }
        //     catch (Exception e)
        //     {
        //         // TODO: Retry system
        //         _logger.LogError(e, "Failed to send registration email");
        //     }
        // });

        return Ok(result);
    }

    #endregion

    #region ResendEmailConfirmation

    public class ResendEmailConfirmationModel
    {
        public string Email { get; set; } = null!;
    }

    [HttpPost("resend-email-confirmation")]
    [ErrorIfAuthenticated]
    public async Task<ActionResult> ResendEmailConfirmation(ResendEmailConfirmationModel model)
    {
        ApplicationUser? user = await _userManager.FindByEmailAsync(model.Email);

        // Don't reveal that the user does not exist
        if (user == null) return Ok();

        string callbackUrl = await GenerateConfirmEmailUrl(user);
        EmailConfirmPayload payload = new()
        {
            UserDisplayName = user.UserName!,
            UserEmail = model.Email,
            CallbackUrl = callbackUrl,
        };

        // await _authMailer.SendEmailConfirm(payload);

        return Ok();
    }

    #endregion

    #region ConfirmEmail

    public class ConfirmEmailModel
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!;
    }

    [HttpPost("confirm-email")]
    [ErrorIfAuthenticated]
    public async Task<ActionResult<bool>> ConfirmEmail(ConfirmEmailModel model)
    {
        ApplicationUser? user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) return false;

        string code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(model.Code));
        IdentityResult result = await _userManager.ConfirmEmailAsync(user, code);

        return result.Succeeded;
    }

    #endregion

    #region RequestPasswordReset

    public class RequestPasswordResetModel
    {
        public string Email { get; set; } = null!;
    }

    [HttpPost("request-password-reset")]
    [ErrorIfAuthenticated]
    public async Task<ActionResult> RequestPasswordReset(RequestPasswordResetModel model)
    {
        var user = await _userManager.FindByEmailAsync(model.Email);

        // Don't reveal that the user does not exist or is not confirmed
        if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
        {
            return Ok();
        }

        string code = await _userManager.GeneratePasswordResetTokenAsync(user);
        code = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(code));

        string callbackUrl = Url.RelativeToAbsolute(Url.Content(
            $"~/auth/complete-password-reset?email={WebUtility.UrlEncode(user.Email)}&code={WebUtility.UrlEncode(code)}"
        ));
        PasswordResetPayload payload = new()
        {
            UserDisplayName = user.UserName!,
            UserEmail = model.Email,
            CallbackUrl = callbackUrl,
        };

        // await _authMailer.SendPasswordReset(payload);

        return Ok();
    }

    #endregion

    #region CompletePasswordReset

    public class CompletePasswordResetModel
    {
        public string Email { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    [HttpPost("complete-password-reset")]
    [ErrorIfAuthenticated]
    public async Task<ActionResult<IdentityResult>> CompletePasswordReset(CompletePasswordResetModel model)
    {
        ApplicationUser? user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) return IdentityResult.Failed(_userManager.ErrorDescriber.InvalidToken());

        string code = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(model.Code));
        return await _userManager.ResetPasswordAsync(user, code, model.Password);
    }

    #endregion

    private async Task<string> GenerateConfirmEmailUrl(ApplicationUser user)
    {
        string confirmToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        confirmToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(confirmToken));

        return Url.RelativeToAbsolute(Url.Content(
            $"~/auth/confirm-email?email={WebUtility.UrlEncode(user.Email)}&code={WebUtility.UrlEncode(confirmToken)}"
        ));
    }
}