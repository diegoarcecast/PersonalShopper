using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;
using PersonalShopper.Domain.Common;
using PersonalShopper.Domain.Entities;
using PersonalShopper.Domain.Interfaces;

namespace PersonalShopper.Application.Services;

public class ProjectService(IProjectRepository repo) : IProjectService
{
    public async Task<ApiResponse<PagedResult<ProjectResponse>>> GetAllAsync(int page, int pageSize)
    {
        var items = await repo.GetAllPagedAsync(page, pageSize);
        var total = await repo.CountAsync();
        var result = new PagedResult<ProjectResponse>
        {
            Items = items.Select(MapToResponse),
            TotalCount = total,
            Page = page,
            PageSize = pageSize
        };
        return ApiResponse<PagedResult<ProjectResponse>>.Ok(result);
    }

    public async Task<ApiResponse<ProjectResponse>> GetByIdAsync(int id)
    {
        var project = await repo.GetByIdAsync(id);
        if (project is null) return ApiResponse<ProjectResponse>.Fail("Proyecto no encontrado");
        return ApiResponse<ProjectResponse>.Ok(MapToResponse(project));
    }

    public async Task<ApiResponse<ProjectResponse>> CreateAsync(CreateProjectRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<ProjectResponse>.Fail("El nombre del proyecto es requerido");

        var project = new Project { Name = request.Name.Trim(), Description = request.Description?.Trim() };
        await repo.AddAsync(project);
        return ApiResponse<ProjectResponse>.Ok(MapToResponse(project), "Proyecto creado exitosamente");
    }

    public async Task<ApiResponse<ProjectResponse>> UpdateAsync(int id, UpdateProjectRequest request)
    {
        var project = await repo.GetByIdAsync(id);
        if (project is null) return ApiResponse<ProjectResponse>.Fail("Proyecto no encontrado");
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<ProjectResponse>.Fail("El nombre del proyecto es requerido");

        project.Name = request.Name.Trim();
        project.Description = request.Description?.Trim();
        project.UpdatedAt = CostaRicaTime.Now;
        await repo.UpdateAsync(project);
        return ApiResponse<ProjectResponse>.Ok(MapToResponse(project), "Proyecto actualizado");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var project = await repo.GetByIdAsync(id);
        if (project is null) return ApiResponse<bool>.Fail("Proyecto no encontrado");
        await repo.DeleteAsync(project);
        return ApiResponse<bool>.Ok(true, "Proyecto eliminado");
    }

    private static ProjectResponse MapToResponse(Project p) =>
        new(p.Id, p.Name, p.Description, p.CreatedAt, p.UpdatedAt, p.Trips.Count);
}
