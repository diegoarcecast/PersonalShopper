using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;
using PersonalShopper.Domain.Common;
using PersonalShopper.Domain.Entities;
using PersonalShopper.Domain.Interfaces;

namespace PersonalShopper.Application.Services;

public class TripService(ITripRepository repo, IProjectRepository projectRepo) : ITripService
{
    public async Task<ApiResponse<PagedResult<TripResponse>>> GetByProjectIdAsync(int projectId, int page, int pageSize)
    {
        var project = await projectRepo.GetByIdAsync(projectId);
        if (project is null) return ApiResponse<PagedResult<TripResponse>>.Fail("Proyecto no encontrado");

        var items = await repo.GetByProjectIdAsync(projectId, page, pageSize);
        var total = await repo.CountByProjectIdAsync(projectId);
        return ApiResponse<PagedResult<TripResponse>>.Ok(new PagedResult<TripResponse>
        {
            Items = items.Select(MapToResponse),
            TotalCount = total, Page = page, PageSize = pageSize
        });
    }

    public async Task<ApiResponse<TripResponse>> GetByIdAsync(int id)
    {
        var trip = await repo.GetByIdAsync(id);
        if (trip is null) return ApiResponse<TripResponse>.Fail("Viaje no encontrado");
        return ApiResponse<TripResponse>.Ok(MapToResponse(trip));
    }

    public async Task<ApiResponse<TripResponse>> CreateAsync(int projectId, CreateTripRequest request)
    {
        var project = await projectRepo.GetByIdAsync(projectId);
        if (project is null) return ApiResponse<TripResponse>.Fail("Proyecto no encontrado");
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<TripResponse>.Fail("El nombre del viaje es requerido");

        var trip = new Trip
        {
            ProjectId = projectId, Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            StartDate = request.StartDate, EndDate = request.EndDate
        };
        await repo.AddAsync(trip);
        return ApiResponse<TripResponse>.Ok(MapToResponse(trip), "Viaje creado exitosamente");
    }

    public async Task<ApiResponse<TripResponse>> UpdateAsync(int id, UpdateTripRequest request)
    {
        var trip = await repo.GetByIdAsync(id);
        if (trip is null) return ApiResponse<TripResponse>.Fail("Viaje no encontrado");
        if (string.IsNullOrWhiteSpace(request.Name))
            return ApiResponse<TripResponse>.Fail("El nombre del viaje es requerido");

        trip.Name = request.Name.Trim();
        trip.Description = request.Description?.Trim();
        trip.StartDate = request.StartDate;
        trip.EndDate = request.EndDate;
        trip.UpdatedAt = CostaRicaTime.Now;
        await repo.UpdateAsync(trip);
        return ApiResponse<TripResponse>.Ok(MapToResponse(trip), "Viaje actualizado");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var trip = await repo.GetByIdAsync(id);
        if (trip is null) return ApiResponse<bool>.Fail("Viaje no encontrado");
        await repo.DeleteAsync(trip);
        return ApiResponse<bool>.Ok(true, "Viaje eliminado");
    }

    private static TripResponse MapToResponse(Trip t) =>
        new(t.Id, t.ProjectId, t.Name, t.Description, t.StartDate, t.EndDate, t.CreatedAt, t.UpdatedAt, t.Days.Count);
}
