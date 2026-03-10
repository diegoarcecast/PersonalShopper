using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;

namespace PersonalShopper.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/days")]
public class DaysController(IDayService dayService) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<DayResponse>>> GetById(int id)
    {
        var result = await dayService.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<DayResponse>>> Update(int id, [FromBody] UpdateDayRequest request)
    {
        var result = await dayService.UpdateAsync(id, request);
        return result.Success ? Ok(result) : result.Message.Contains("no encontrado") ? NotFound(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        var result = await dayService.DeleteAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    // Orders nested under day
    [HttpGet("{dayId:int}/orders")]
    public async Task<ActionResult<ApiResponse<PagedResult<OrderResponse>>>> GetOrders(
        int dayId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50,
        [FromQuery] string? search = null,
        [FromQuery] bool? conTdj = null,
        [FromServices] IOrderService orderService = null!)
        => Ok(await orderService.GetByDayIdAsync(dayId, page, pageSize, search, conTdj));

    [HttpPost("{dayId:int}/orders")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ApiResponse<OrderResponse>>> CreateOrder(
        int dayId, [FromForm] string nombrePersona,
        [FromForm] string? producto, [FromForm] string? descripcion,
        [FromForm] int redSocial = 0, [FromForm] string? usuarioRedSocial = null,
        [FromForm] string? usuarioAsignadoFuturo = null,
        IFormFile? foto = null,
        [FromServices] IOrderService orderService = null!)
    {
        byte[]? fotoData = null;
        if (foto is not null)
        {
            using var ms = new MemoryStream();
            await foto.CopyToAsync(ms);
            fotoData = ms.ToArray();
        }
        var result = await orderService.CreateAsync(dayId, nombrePersona, producto, descripcion,
            redSocial, usuarioRedSocial, fotoData, usuarioAsignadoFuturo);
        return result.Success ? Created($"/api/v1/orders/{result.Data!.Id}", result) : BadRequest(result);
    }

    [HttpGet("{dayId:int}/orders/export")]
    public async Task<IActionResult> ExportOrders(int dayId, [FromServices] IExportService exportService)
    {
        var bytes = await exportService.ExportOrdersToExcelAsync(dayId);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"ordenes-dia-{dayId}-{DateTime.Now:yyyyMMdd}.xlsx");
    }
}
