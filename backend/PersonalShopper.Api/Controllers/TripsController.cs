using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;

namespace PersonalShopper.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/trips")]
public class TripsController(ITripService tripService) : ControllerBase
{
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<TripResponse>>> GetById(int id)
    {
        var result = await tripService.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<TripResponse>>> Update(int id, [FromBody] UpdateTripRequest request)
    {
        var result = await tripService.UpdateAsync(id, request);
        return result.Success ? Ok(result) : result.Message.Contains("no encontrado") ? NotFound(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        var result = await tripService.DeleteAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    // Days nested under trip
    [HttpGet("{tripId:int}/days")]
    public async Task<ActionResult<ApiResponse<PagedResult<DayResponse>>>> GetDays(
        int tripId, [FromQuery] int page = 1, [FromQuery] int pageSize = 50,
        [FromServices] IDayService dayService = null!)
        => Ok(await dayService.GetByTripIdAsync(tripId, page, pageSize));

    [HttpPost("{tripId:int}/days")]
    public async Task<ActionResult<ApiResponse<DayResponse>>> CreateDay(
        int tripId, [FromBody] CreateDayRequest request,
        [FromServices] IDayService dayService = null!)
    {
        var result = await dayService.CreateAsync(tripId, request);
        return result.Success ? Created($"/api/v1/days/{result.Data!.Id}", result) : BadRequest(result);
    }

    [HttpGet("{tripId:int}/export")]
    public async Task<IActionResult> ExportTrip(int tripId, [FromServices] IExportService exportService)
    {
        var bytes = await exportService.ExportTripToExcelAsync(tripId);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"viaje-{tripId}-{DateTime.Now:yyyyMMdd}.xlsx");
    }
}
