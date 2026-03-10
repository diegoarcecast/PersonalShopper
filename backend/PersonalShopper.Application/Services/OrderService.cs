using System.Text.RegularExpressions;
using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;
using PersonalShopper.Application.Interfaces;
using PersonalShopper.Domain.Common;
using PersonalShopper.Domain.Entities;
using PersonalShopper.Domain.Enums;
using PersonalShopper.Domain.Interfaces;

namespace PersonalShopper.Application.Services;

public class OrderService(IOrderRepository repo, IDayRepository dayRepo) : IOrderService
{
    public async Task<ApiResponse<PagedResult<OrderResponse>>> GetByDayIdAsync(int dayId, int page, int pageSize, string? search = null, bool? conTdj = null)
    {
        var day = await dayRepo.GetByIdAsync(dayId);
        if (day is null) return ApiResponse<PagedResult<OrderResponse>>.Fail("Día no encontrado");

        var items = await repo.GetByDayIdAsync(dayId, page, pageSize, search, conTdj);
        var total = await repo.CountByDayIdAsync(dayId, search, conTdj);
        return ApiResponse<PagedResult<OrderResponse>>.Ok(new PagedResult<OrderResponse>
        {
            Items = items.Select(MapToResponse),
            TotalCount = total, Page = page, PageSize = pageSize
        });
    }

    public async Task<ApiResponse<OrderResponse>> GetByIdAsync(int id)
    {
        var order = await repo.GetByIdAsync(id);
        if (order is null) return ApiResponse<OrderResponse>.Fail("Orden no encontrada");
        return ApiResponse<OrderResponse>.Ok(MapToResponse(order));
    }

    public async Task<ApiResponse<OrderResponse>> CreateAsync(int dayId, string nombrePersona, string? producto,
        string? descripcion, int redSocial, string? usuarioRedSocial, byte[]? fotoData, string? usuarioAsignadoFuturo)
    {
        var day = await dayRepo.GetByIdAsync(dayId);
        if (day is null) return ApiResponse<OrderResponse>.Fail("Día no encontrado");
        if (string.IsNullOrWhiteSpace(nombrePersona))
            return ApiResponse<OrderResponse>.Fail("El nombre de persona es requerido");
        if (!string.IsNullOrWhiteSpace(usuarioAsignadoFuturo) && !Regex.IsMatch(usuarioAsignadoFuturo, @"^TDJ\d+$"))
            return ApiResponse<OrderResponse>.Fail("El código debe tener formato TDJ seguido de números (ej. TDJ0001)");

        var order = new Order
        {
            DayId = dayId, NombrePersona = nombrePersona.Trim(),
            Producto = producto?.Trim(), Descripcion = descripcion?.Trim(),
            RedSocial = (RedSocial)redSocial,
            UsuarioRedSocial = usuarioRedSocial?.Trim(),
            FotoData = fotoData,
            UsuarioAsignadoFuturo = usuarioAsignadoFuturo?.Trim()
        };
        await repo.AddAsync(order);
        return ApiResponse<OrderResponse>.Ok(MapToResponse(order), "Orden creada exitosamente");
    }

    public async Task<ApiResponse<OrderResponse>> UpdateAsync(int id, string nombrePersona, string? producto,
        string? descripcion, int redSocial, string? usuarioRedSocial, byte[]? fotoData, string? usuarioAsignadoFuturo)
    {
        var order = await repo.GetByIdAsync(id);
        if (order is null) return ApiResponse<OrderResponse>.Fail("Orden no encontrada");
        if (string.IsNullOrWhiteSpace(nombrePersona))
            return ApiResponse<OrderResponse>.Fail("El nombre de persona es requerido");
        if (!string.IsNullOrWhiteSpace(usuarioAsignadoFuturo) && !Regex.IsMatch(usuarioAsignadoFuturo, @"^TDJ\d+$"))
            return ApiResponse<OrderResponse>.Fail("El código debe tener formato TDJ seguido de números (ej. TDJ0001)");

        order.NombrePersona = nombrePersona.Trim();
        order.Producto = producto?.Trim();
        order.Descripcion = descripcion?.Trim();
        order.RedSocial = (RedSocial)redSocial;
        order.UsuarioRedSocial = usuarioRedSocial?.Trim();
        if (fotoData is not null) order.FotoData = fotoData;
        order.UsuarioAsignadoFuturo = usuarioAsignadoFuturo?.Trim();
        order.UpdatedAt = CostaRicaTime.Now;
        await repo.UpdateAsync(order);
        return ApiResponse<OrderResponse>.Ok(MapToResponse(order), "Orden actualizada");
    }

    public async Task<ApiResponse<bool>> DeleteAsync(int id)
    {
        var order = await repo.GetByIdAsync(id);
        if (order is null) return ApiResponse<bool>.Fail("Orden no encontrada");
        await repo.DeleteAsync(order);
        return ApiResponse<bool>.Ok(true, "Orden eliminada");
    }

    private static OrderResponse MapToResponse(Order o) => new(
        o.Id, o.DayId, o.NombrePersona, o.Producto, o.Descripcion,
        o.RedSocial.ToString(),
        o.UsuarioRedSocial,
        o.FotoData is not null ? Convert.ToBase64String(o.FotoData) : null,
        o.UsuarioAsignadoFuturo, o.CreatedAt, o.UpdatedAt);
}
