using Microsoft.EntityFrameworkCore;
using PersonalShopper.Domain.Entities;
using PersonalShopper.Domain.Interfaces;
using PersonalShopper.Infrastructure.Data;

namespace PersonalShopper.Infrastructure.Repositories;

public class ProjectRepository(AppDbContext db) : IProjectRepository
{
    public async Task<Project?> GetByIdAsync(int id) =>
        await db.Projects.Include(p => p.Trips).FirstOrDefaultAsync(p => p.Id == id);

    public async Task<IEnumerable<Project>> GetAllAsync() =>
        await db.Projects.Include(p => p.Trips).ToListAsync();

    public async Task<IEnumerable<Project>> GetAllPagedAsync(int page, int pageSize) =>
        await db.Projects.Include(p => p.Trips)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

    public async Task<int> CountAsync() => await db.Projects.CountAsync();

    public async Task<Project> AddAsync(Project entity)
    {
        db.Projects.Add(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    public async Task UpdateAsync(Project entity)
    {
        db.Projects.Update(entity);
        await db.SaveChangesAsync();
    }

    public async Task DeleteAsync(Project entity)
    {
        db.Projects.Remove(entity);
        await db.SaveChangesAsync();
    }
}
