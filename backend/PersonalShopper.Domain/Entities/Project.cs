namespace PersonalShopper.Domain.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    // Navigation
    public ICollection<Trip> Trips { get; set; } = new List<Trip>();
}
