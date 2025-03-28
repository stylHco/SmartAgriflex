namespace SmartAgriFlex.SpaBackend.Features.Identity.Emails;

public sealed class EmailConfirmPayload
{
    public required string UserDisplayName { get; init; }
    public required string UserEmail { get; init; }
    
    public required string CallbackUrl { get; init; }
}