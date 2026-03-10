using PersonalShopper.Domain.Entities;

namespace PersonalShopper.Domain.Interfaces;

public interface ITripRepository : IRepository<Trip>
{
    Task<IEnumerable<Trip>> GetByProjectIdAsync(int projectId, int page, int pageSize);
    Task<int> CountByProjectIdAsync(int projectId);
}
