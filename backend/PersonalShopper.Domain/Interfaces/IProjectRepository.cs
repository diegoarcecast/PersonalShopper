using PersonalShopper.Domain.Entities;

namespace PersonalShopper.Domain.Interfaces;

public interface IProjectRepository : IRepository<Project>
{
    Task<IEnumerable<Project>> GetAllPagedAsync(int page, int pageSize);
    Task<int> CountAsync();
}
