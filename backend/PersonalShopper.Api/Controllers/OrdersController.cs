using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;

namespace PersonalShopper.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/orders")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> GetById(int id)
    {
        var result = await orderService.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> Update(
        int id, [FromForm] string nombrePersona,
        [FromForm] string? producto, [FromForm] string? descripcion,
        [FromForm] int redSocial = 0, [FromForm] string? usuarioRedSocial = null,
        [FromForm] string? usuarioAsignadoFuturo = null,
        IFormFile? foto = null)
    {
        byte[]? fotoData = null;
        if (foto is not null)
        {
            using var ms = new MemoryStream();
            await foto.CopyToAsync(ms);
            fotoData = ms.ToArray();
        }
        var result = await orderService.UpdateAsync(id, nombrePersona, producto, descripcion,
            redSocial, usuarioRedSocial, fotoData, usuarioAsignadoFuturo);
        return result.Success ? Ok(result) : result.Message.Contains("no encontrado") ? NotFound(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        var result = await orderService.DeleteAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }
}
