using PersonalShopper.Domain.Entities;

namespace PersonalShopper.Domain.Interfaces;

public interface IDayRepository : IRepository<Day>
{
    Task<IEnumerable<Day>> GetByTripIdAsync(int tripId, int page, int pageSize);
    Task<int> CountByTripIdAsync(int tripId);
    Task<bool> ExistsByTripIdAndDayNumberAsync(int tripId, int dayNumber, int? excludeId = null);
}
