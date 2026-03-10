namespace PersonalShopper.Domain.Entities;

public class Day : BaseEntity
{
    public int TripId { get; set; }
    public int DayNumber { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public Trip Trip { get; set; } = null!;
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
