using Microsoft.AspNetCore.Identity;

namespace PersonalShopper.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public string? RefreshToken { get; set; }             // for future refresh token flow
    public DateTime? RefreshTokenExpiry { get; set; }
}
