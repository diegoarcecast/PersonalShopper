using PersonalShopper.Domain.Common;

namespace PersonalShopper.Domain.Entities;

public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = CostaRicaTime.Now;
    public DateTime UpdatedAt { get; set; } = CostaRicaTime.Now;
}
