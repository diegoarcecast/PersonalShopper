using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PersonalShopper.Domain.Entities;
using PersonalShopper.Infrastructure.Identity;

namespace PersonalShopper.Infrastructure.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Trip> Trips => Set<Trip>();
    public DbSet<Day> Days => Set<Day>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Project
        builder.Entity<Project>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(1000);
        });

        // Trip
        builder.Entity<Trip>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Name).IsRequired().HasMaxLength(200);
            e.Property(x => x.Description).HasMaxLength(1000);
            e.HasOne(x => x.Project).WithMany(x => x.Trips)
                .HasForeignKey(x => x.ProjectId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.ProjectId);
        });

        // Day - unique DayNumber per Trip
        builder.Entity<Day>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Notes).HasMaxLength(2000);
            e.HasOne(x => x.Trip).WithMany(x => x.Days)
                .HasForeignKey(x => x.TripId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.TripId);
            e.HasIndex(x => new { x.TripId, x.DayNumber }).IsUnique();
        });

        // Order
        builder.Entity<Order>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.NombrePersona).IsRequired().HasMaxLength(300);
            e.Property(x => x.Producto).HasMaxLength(500);
            e.Property(x => x.Descripcion).HasMaxLength(2000);
            e.Property(x => x.RedSocial).HasConversion<int>();
            e.Property(x => x.UsuarioRedSocial).HasMaxLength(200);
            e.Property(x => x.UsuarioAsignadoFuturo).HasMaxLength(200);
            e.Property(x => x.FotoData).HasColumnType("varbinary(max)");
            e.HasOne(x => x.Day).WithMany(x => x.Orders)
                .HasForeignKey(x => x.DayId).OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.DayId);
            e.HasIndex(x => x.NombrePersona);
        });
    }
}
