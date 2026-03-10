using Microsoft.EntityFrameworkCore;
using PersonalShopper.Domain.Entities;
using PersonalShopper.Domain.Interfaces;
using PersonalShopper.Infrastructure.Data;

namespace PersonalShopper.Infrastructure.Repositories;

public class DayRepository(AppDbContext db) : IDayRepository
{
    public async Task<Day?> GetByIdAsync(int id) =>
        await db.Days.Include(d => d.Orders).Include(d => d.Trip).FirstOrDefaultAsync(d => d.Id == id);

    public async Task<IEnumerable<Day>> GetAllAsync() => await db.Days.ToListAsync();

    public async Task<IEnumerable<Day>> GetByTripIdAsync(int tripId, int page, int pageSize) =>
        await db.Days.Include(d => d.Orders)
            .Where(d => d.TripId == tripId)
            .OrderBy(d => d.DayNumber)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

    public async Task<int> CountByTripIdAsync(int tripId) =>
        await db.Days.CountAsync(d => d.TripId == tripId);

    public async Task<bool> ExistsByTripIdAndDayNumberAsync(int tripId, int dayNumber, int? excludeId = null) =>
        await db.Days.AnyAsync(d => d.TripId == tripId && d.DayNumber == dayNumber && (excludeId == null || d.Id != excludeId));

    public async Task<Day> AddAsync(Day entity) { db.Days.Add(entity); await db.SaveChangesAsync(); return entity; }
    public async Task UpdateAsync(Day entity) { db.Days.Update(entity); await db.SaveChangesAsync(); }
    public async Task DeleteAsync(Day entity) { db.Days.Remove(entity); await db.SaveChangesAsync(); }
}
