namespace PersonalShopper.Domain.Entities;

public class Trip : BaseEntity
{
    public int ProjectId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }

    // Navigation
    public Project Project { get; set; } = null!;
    public ICollection<Day> Days { get; set; } = new List<Day>();
}
