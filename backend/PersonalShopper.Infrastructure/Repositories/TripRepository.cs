using Microsoft.EntityFrameworkCore;
using PersonalShopper.Domain.Entities;
using PersonalShopper.Domain.Interfaces;
using PersonalShopper.Infrastructure.Data;

namespace PersonalShopper.Infrastructure.Repositories;

public class TripRepository(AppDbContext db) : ITripRepository
{
    public async Task<Trip?> GetByIdAsync(int id) =>
        await db.Trips.Include(t => t.Days).Include(t => t.Project).FirstOrDefaultAsync(t => t.Id == id);

    public async Task<IEnumerable<Trip>> GetAllAsync() => await db.Trips.ToListAsync();

    public async Task<IEnumerable<Trip>> GetByProjectIdAsync(int projectId, int page, int pageSize) =>
        await db.Trips.Include(t => t.Days)
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

    public async Task<int> CountByProjectIdAsync(int projectId) =>
        await db.Trips.CountAsync(t => t.ProjectId == projectId);

    public async Task<Trip> AddAsync(Trip entity) { db.Trips.Add(entity); await db.SaveChangesAsync(); return entity; }
    public async Task UpdateAsync(Trip entity) { db.Trips.Update(entity); await db.SaveChangesAsync(); }
    public async Task DeleteAsync(Trip entity) { db.Trips.Remove(entity); await db.SaveChangesAsync(); }
}
