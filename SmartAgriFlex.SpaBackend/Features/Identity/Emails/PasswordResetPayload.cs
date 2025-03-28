namespace SmartAgriFlex.SpaBackend.Features.Identity.Emails;

public sealed class PasswordResetPayload
{
    public required string UserDisplayName { get; init; }
    public required string UserEmail { get; init; }
    
    public required string CallbackUrl { get; init; }
}