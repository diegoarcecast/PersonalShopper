using PersonalShopper.Application.Common;
using PersonalShopper.Application.DTOs;

namespace PersonalShopper.Application.Interfaces;

public interface IAuthService
{
    Task<ApiResponse<AuthResponse>> RegisterAsync(RegisterRequest request);
    Task<ApiResponse<AuthResponse>> LoginAsync(LoginRequest request);
}

public interface IProjectService
{
    Task<ApiResponse<PagedResult<ProjectResponse>>> GetAllAsync(int page, int pageSize);
    Task<ApiResponse<ProjectResponse>> GetByIdAsync(int id);
    Task<ApiResponse<ProjectResponse>> CreateAsync(CreateProjectRequest request);
    Task<ApiResponse<ProjectResponse>> UpdateAsync(int id, UpdateProjectRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}

public interface ITripService
{
    Task<ApiResponse<PagedResult<TripResponse>>> GetByProjectIdAsync(int projectId, int page, int pageSize);
    Task<ApiResponse<TripResponse>> GetByIdAsync(int id);
    Task<ApiResponse<TripResponse>> CreateAsync(int projectId, CreateTripRequest request);
    Task<ApiResponse<TripResponse>> UpdateAsync(int id, UpdateTripRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}

public interface IDayService
{
    Task<ApiResponse<PagedResult<DayResponse>>> GetByTripIdAsync(int tripId, int page, int pageSize);
    Task<ApiResponse<DayResponse>> GetByIdAsync(int id);
    Task<ApiResponse<DayResponse>> CreateAsync(int tripId, CreateDayRequest request);
    Task<ApiResponse<DayResponse>> UpdateAsync(int id, UpdateDayRequest request);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}

public interface IOrderService
{
    Task<ApiResponse<PagedResult<OrderResponse>>> GetByDayIdAsync(int dayId, int page, int pageSize, string? search = null, bool? conTdj = null);
    Task<ApiResponse<OrderResponse>> GetByIdAsync(int id);
    Task<ApiResponse<OrderResponse>> CreateAsync(int dayId, string nombrePersona, string? producto,
        string? descripcion, int redSocial, string? usuarioRedSocial, byte[]? fotoData, string? usuarioAsignadoFuturo);
    Task<ApiResponse<OrderResponse>> UpdateAsync(int id, string nombrePersona, string? producto,
        string? descripcion, int redSocial, string? usuarioRedSocial, byte[]? fotoData, string? usuarioAsignadoFuturo);
    Task<ApiResponse<bool>> DeleteAsync(int id);
}

public interface IExportService
{
    Task<byte[]> ExportOrdersToExcelAsync(int dayId);
    Task<byte[]> ExportTripToExcelAsync(int tripId);
    Task<byte[]> ExportProjectToExcelAsync(int projectId);
}
