using Microsoft.EntityFrameworkCore;
using PersonalShopper.Domain.Entities;
using PersonalShopper.Domain.Interfaces;
using PersonalShopper.Infrastructure.Data;

namespace PersonalShopper.Infrastructure.Repositories;

public class OrderRepository(AppDbContext db) : IOrderRepository
{
    public async Task<Order?> GetByIdAsync(int id) =>
        await db.Orders.Include(o => o.Day).FirstOrDefaultAsync(o => o.Id == id);

    public async Task<IEnumerable<Order>> GetAllAsync() => await db.Orders.ToListAsync();

    public async Task<IEnumerable<Order>> GetByDayIdAsync(int dayId, int page, int pageSize, string? search = null, bool? conTdj = null)
    {
        var query = db.Orders.Where(o => o.DayId == dayId);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(o => o.NombrePersona.Contains(search) || (o.Producto != null && o.Producto.Contains(search)));
        if (conTdj == true)
            query = query.Where(o => o.UsuarioAsignadoFuturo != null && o.UsuarioAsignadoFuturo != "");
        else if (conTdj == false)
            query = query.Where(o => o.UsuarioAsignadoFuturo == null || o.UsuarioAsignadoFuturo == "");
        return await query.OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    }

    public async Task<int> CountByDayIdAsync(int dayId, string? search = null, bool? conTdj = null)
    {
        var query = db.Orders.Where(o => o.DayId == dayId);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(o => o.NombrePersona.Contains(search) || (o.Producto != null && o.Producto.Contains(search)));
        if (conTdj == true)
            query = query.Where(o => o.UsuarioAsignadoFuturo != null && o.UsuarioAsignadoFuturo != "");
        else if (conTdj == false)
            query = query.Where(o => o.UsuarioAsignadoFuturo == null || o.UsuarioAsignadoFuturo == "");
        return await query.CountAsync();
    }

    public async Task<IEnumerable<Order>> GetAllByDayIdAsync(int dayId) =>
        await db.Orders.Include(o => o.Day).Where(o => o.DayId == dayId).OrderByDescending(o => o.CreatedAt).ToListAsync();

    public async Task<IEnumerable<Order>> GetAllByTripIdAsync(int tripId) =>
        await db.Orders.Include(o => o.Day).ThenInclude(d => d!.Trip)
            .Where(o => o.Day!.TripId == tripId)
            .OrderBy(o => o.Day!.DayNumber).ThenByDescending(o => o.CreatedAt).ToListAsync();

    public async Task<IEnumerable<Order>> GetAllByProjectIdAsync(int projectId) =>
        await db.Orders.Include(o => o.Day).ThenInclude(d => d!.Trip).ThenInclude(t => t!.Project)
            .Where(o => o.Day!.Trip!.ProjectId == projectId)
            .OrderBy(o => o.Day!.Trip!.Name).ThenBy(o => o.Day!.DayNumber).ThenByDescending(o => o.CreatedAt).ToListAsync();

    public async Task<Order> AddAsync(Order entity) { db.Orders.Add(entity); await db.SaveChangesAsync(); return entity; }
    public async Task UpdateAsync(Order entity) { db.Orders.Update(entity); await db.SaveChangesAsync(); }
    public async Task DeleteAsync(Order entity) { db.Orders.Remove(entity); await db.SaveChangesAsync(); }
}
