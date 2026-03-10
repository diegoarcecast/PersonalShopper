using Microsoft.AspNetCore.Mvc;
using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;

namespace PersonalShopper.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register([FromBody] RegisterRequest request)
    {
        var result = await authService.RegisterAsync(request);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
    {
        var result = await authService.LoginAsync(request);
        return result.Success ? Ok(result) : Unauthorized(result);
    }
}
