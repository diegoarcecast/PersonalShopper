namespace PersonalShopper.Application.DTOs;

// Auth
public record RegisterRequest(string Email, string Password, string ConfirmPassword);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string Token, string Email, DateTime ExpiresAt);

// Project
public record CreateProjectRequest(string Name, string? Description);
public record UpdateProjectRequest(string Name, string? Description);
public record ProjectResponse(int Id, string Name, string? Description, DateTime CreatedAt, DateTime UpdatedAt, int TripCount);

// Trip
public record CreateTripRequest(string Name, string? Description, DateTime? StartDate, DateTime? EndDate);
public record UpdateTripRequest(string Name, string? Description, DateTime? StartDate, DateTime? EndDate);
public record TripResponse(int Id, int ProjectId, string Name, string? Description, DateTime? StartDate, DateTime? EndDate, DateTime CreatedAt, DateTime UpdatedAt, int DayCount);

// Day
public record CreateDayRequest(int DayNumber, string? Notes);
public record UpdateDayRequest(int DayNumber, string? Notes);
public record DayResponse(int Id, int TripId, int DayNumber, string? Notes, DateTime CreatedAt, DateTime UpdatedAt, int OrderCount);

// Order
public record OrderResponse(
    int Id, int DayId, string NombrePersona, string? Producto, string? Descripcion,
    string RedSocial, string? UsuarioRedSocial, string? FotoBase64,
    string? UsuarioAsignadoFuturo, DateTime CreatedAt, DateTime UpdatedAt);
