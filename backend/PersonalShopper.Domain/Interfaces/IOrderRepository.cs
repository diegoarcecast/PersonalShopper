using PersonalShopper.Domain.Entities;

namespace PersonalShopper.Domain.Interfaces;

public interface IOrderRepository : IRepository<Order>
{
    Task<IEnumerable<Order>> GetByDayIdAsync(int dayId, int page, int pageSize, string? search = null, bool? conTdj = null);
    Task<int> CountByDayIdAsync(int dayId, string? search = null, bool? conTdj = null);
    Task<IEnumerable<Order>> GetAllByDayIdAsync(int dayId);
    Task<IEnumerable<Order>> GetAllByTripIdAsync(int tripId);
    Task<IEnumerable<Order>> GetAllByProjectIdAsync(int projectId);
}
