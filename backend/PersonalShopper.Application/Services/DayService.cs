using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;
using PersonalShopper.Domain.Common;
using PersonalShopper.Domain.Entities;
using PersonalShopper.Domain.Interfaces;

namespace PersonalShopper.Application.Services;

public class DayService(IDayRepository repo, ITripRepository tripRepo) : IDayService
{
    public async Task<ApiResponse<PagedResult<DayResponse>>> GetByTripIdAsync(int tripId, int page, int pageSize)
    {
        var trip = await tripRepo.GetByIdAsync(tripId);
        if (trip is null) return ApiResponse<PagedResult<DayResponse>>.Fail("Viaje no encontrado");

        var items = await repo.GetByTripIdAsync(tripId, page, pageSize);
        var total = await repo.CountByTripIdAsync(tripId);
        return ApiResponse<PagedResult<DayResponse>>.Ok(new PagedResult<DayResponse>
        {
            Items = items.Select(MapToResponse),
            TotalCount = total, Page = page, PageSize = pageSize
        });
    }

    public async Task<ApiResponse<DayResponse>> GetByIdAsync(int id)
    {
        var day = await repo.GetByIdAsync(id);
        if (day is null) return ApiResponse<DayResponse>.Fail("Día no encontrado");
        return ApiResponse<DayResponse>.Ok(MapToResponse(day));
    }

    public async Task<ApiResponse<DayResponse>> CreateAsync(int tripId, CreateDayRequest request)
    {
        var trip = await tripRepo.GetByIdAsync(tripId);
        if (trip is null) return ApiResponse<DayResponse>.Fail("Viaje no encontrado");
        if (request.DayNumber < 1)
            return ApiResponse<DayResponse>.Fail("El número de día debe ser mayor a 0");

        var exists = await repo.ExistsByTripIdAndDayNumberAsync(tripId, request.DayNumber);
        if (exists) return ApiResponse<DayResponse>.Fail($"El Día #{request.DayNumber} ya existe en este viaje");

        var day = new Day { TripId = tripId, DayNumber = request.DayNumber, Notes = request.Notes?.Trim() };
        await repo.AddAsync(day);
        return ApiResponse<DayResponse>.Ok(MapToResponse(day), "Día creado exitosamente");
    }

    public async Task<ApiResponse<DayResponse>> UpdateAsync(int id, UpdateDayRequest request)
    {
        var day = await repo.GetByIdAsync(id);
        if (day is null) return ApiResponse<DayResponse>.Fail("Día no encontrado");
        if (request.DayNumber < 1)
            return ApiResponse<DayResponse>.Fail("El número de día debe ser mayor a 0");

        var exists = await repo.ExistsByTripIdAndDayNumberAsync(day.TripId, request.DayNumber, id);
        if (exists) return ApiResponse<DayResponse>.Fail($"El Día #{request.DayNumber} ya existe en este viaje");

        day.DayNumber = request.DayNumber;
        day.Notes = request.Notes?.Trim();
        day.UpdatedAt = CostaRicaTime.Now;
        await repo.UpdateAsync(day);
        return ApiResponse<DayResponse>.Ok(MapToResponse(day), "Día actualizado");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var day = await repo.GetByIdAsync(id);
        if (day is null) return ApiResponse<bool>.Fail("Día no encontrado");
        await repo.DeleteAsync(day);
        return ApiResponse<bool>.Ok(true, "Día eliminado");
    }

    private static DayResponse MapToResponse(Day d) =>
        new(d.Id, d.TripId, d.DayNumber, d.Notes, d.CreatedAt, d.UpdatedAt, d.Orders.Count);
}
