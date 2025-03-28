using System.Collections.Generic;
using System.Threading.Tasks;
using BeekeepingMonitoring.SpaBackend.Emails;
using MailKitSimplified.Sender.Abstractions;

namespace BeekeepingMonitoring.SpaBackend.Features.Identity.Emails;

public interface IAuthMailer
{
    Task SendPasswordReset(PasswordResetPayload payload);
    Task SendEmailConfirm(EmailConfirmPayload payload);
}

[AutoConstructor]
[RegisterSingleton]
public partial class AuthMailer : IAuthMailer
{
    private readonly IEmailHelper _emailHelper;
    private readonly ISmtpSender _smtpSender;

    public async Task SendPasswordReset(PasswordResetPayload payload)
    {
        await _smtpSender
            .WriteEmail
            .DefaultFrom(_emailHelper)
            .To(payload.UserDisplayName, payload.UserEmail)
            .Subject(payload.UserDisplayName + " - Reset your Password.")
            .BodyHtml(await _emailHelper.Render<PasswordReset>(new Dictionary<string, object?>
            {
                [nameof(PasswordReset.Payload)] = payload,
            }))
            .SendAsync();
    }

    public async Task SendEmailConfirm(EmailConfirmPayload payload)
    {
        await _smtpSender
            .WriteEmail
            .DefaultFrom(_emailHelper)
            .To(payload.UserDisplayName, payload.UserEmail)
            .Subject("Nutritionist - Activate your Account.")
            .BodyHtml(await _emailHelper.Render<EmailConfirm>(new Dictionary<string, object?>
            {
                [nameof(EmailConfirm.Payload)] = payload,
            }))
            .SendAsync();
    }
}