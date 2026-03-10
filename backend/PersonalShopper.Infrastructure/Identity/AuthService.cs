using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;
using PersonalShopper.Infrastructure.Identity;

namespace PersonalShopper.Infrastructure.Identity;

public class AuthService(UserManager<ApplicationUser> userManager, IConfiguration config) : IAuthService
{
    public async Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request)
    {
        if (request.Password != request.ConfirmPassword)
            return ApiResponse<AuthResponse>.Fail("Las contraseñas no coinciden");

        var existing = await userManager.FindByEmailAsync(request.Email);
        if (existing is not null) return ApiResponse<AuthResponse>.Fail("El email ya está registrado");

        var user = new ApplicationUser { UserName = request.Email, Email = request.Email };
        var result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
            return ApiResponse<AuthResponse>.Fail("Error al crear usuario", result.Errors.Select(e => e.Description));

        await userManager.AddToRoleAsync(user, "Admin");
        var token = GenerateToken(user);
        return ApiResponse<AuthResponse>.Ok(token, "Usuario registrado exitosamente");
    }

    public async Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user is null) return ApiResponse<AuthResponse>.Fail("Credenciales inválidas");

        var valid = await userManager.CheckPasswordAsync(user, request.Password);
        if (!valid) return ApiResponse<AuthResponse>.Fail("Credenciales inválidas");

        var token = GenerateToken(user);
        return ApiResponse<AuthResponse>.Ok(token, "Login exitoso");
    }

    private AuthResponse GenerateToken(ApplicationUser user)
    {
        var key = Encoding.UTF8.GetBytes(config["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured"));
        var expiry = DateTime.UtcNow.AddDays(7);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email!),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.Id)
        };

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
        );

        return new AuthResponse(new JwtSecurityTokenHandler().WriteToken(token), user.Email!, expiry);
    }
}
