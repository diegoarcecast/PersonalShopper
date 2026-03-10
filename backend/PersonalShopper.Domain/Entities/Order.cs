using PersonalShopper.Domain.Enums;

namespace PersonalShopper.Domain.Entities;

public class Order : BaseEntity
{
    public int DayId { get; set; }
    public string NombrePersona { get; set; } = string.Empty;
    public string? Producto { get; set; }
    public string? Descripcion { get; set; }
    public RedSocial RedSocial { get; set; } = RedSocial.TikTok;
    public string? UsuarioRedSocial { get; set; }
    public byte[]? FotoData { get; set; }
    public string? UsuarioAsignadoFuturo { get; set; }

    // Navigation
    public Day Day { get; set; } = null!;
}
