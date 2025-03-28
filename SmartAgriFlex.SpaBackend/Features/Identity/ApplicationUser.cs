using System;
using Microsoft.AspNetCore.Identity;

namespace SmartAgriFlex.SpaBackend.Features.Identity;

public class ApplicationUser : IdentityUser<Guid>
{
    public ApplicationUser()
    {
        // ReSharper disable once VirtualMemberCallInConstructor - Microsoft.AspNetCore.Identity.IdentityUser does the same
        Id = Guid.NewGuid();
    }
}