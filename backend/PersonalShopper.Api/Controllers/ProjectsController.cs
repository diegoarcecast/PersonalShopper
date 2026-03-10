using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;

namespace PersonalShopper.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/projects")]
public class ProjectsController(IProjectService projectService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProjectResponse>>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
        => Ok(await projectService.GetAllAsync(page, pageSize));

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProjectResponse>>> GetById(int id)
    {
        var result = await projectService.GetByIdAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProjectResponse>>> Create([FromBody] CreateProjectRequest request)
    {
        var result = await projectService.CreateAsync(request);
        return result.Success ? CreatedAtAction(nameof(GetById), new { id = result.Data!.Id }, result) : BadRequest(result);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<ProjectResponse>>> Update(int id, [FromBody] UpdateProjectRequest request)
    {
        var result = await projectService.UpdateAsync(id, request);
        return result.Success ? Ok(result) : result.Message.Contains("no encontrado") ? NotFound(result) : BadRequest(result);
    }

    [HttpDelete("{id:int}")]
    public async Task<ActionResult<ApiResponse<bool>>> Delete(int id)
    {
        var result = await projectService.DeleteAsync(id);
        return result.Success ? Ok(result) : NotFound(result);
    }

    // Trips nested under project
    [HttpGet("{projectId:int}/trips")]
    public async Task<ActionResult<ApiResponse<PagedResult<TripResponse>>>> GetTrips(
        int projectId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20,
        [FromServices] ITripService tripService = null!)
        => Ok(await tripService.GetByProjectIdAsync(projectId, page, pageSize));

    [HttpPost("{projectId:int}/trips")]
    public async Task<ActionResult<ApiResponse<TripResponse>>> CreateTrip(
        int projectId, [FromBody] CreateTripRequest request,
        [FromServices] ITripService tripService = null!)
    {
        var result = await tripService.CreateAsync(projectId, request);
        return result.Success ? Created($"/api/v1/trips/{result.Data!.Id}", result) : BadRequest(result);
    }

    [HttpGet("{projectId:int}/export")]
    public async Task<IActionResult> ExportProject(int projectId, [FromServices] IExportService exportService)
    {
        var bytes = await exportService.ExportProjectToExcelAsync(projectId);
        return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"proyecto-{projectId}-{DateTime.Now:yyyyMMdd}.xlsx");
    }
}
