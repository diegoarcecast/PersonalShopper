import { api } from './api';
import { ApiResponse, AuthResponse, PagedResult, Project, Trip, Day, Order } from '../types';

// Auth
export const authService = {
    register: (email: string, password: string, confirmPassword: string) =>
        api.post<ApiResponse<AuthResponse>>('/auth/register', { email, password, confirmPassword }),
    login: (email: string, password: string) =>
        api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password }),
};

// Projects
export const projectService = {
    getAll: (page = 1, pageSize = 20) =>
        api.get<ApiResponse<PagedResult<Project>>>('/projects', { params: { page, pageSize } }),
    getById: (id: number) => api.get<ApiResponse<Project>>(`/projects/${id}`),
    create: (data: { name: string; description?: string }) =>
        api.post<ApiResponse<Project>>('/projects', data),
    update: (id: number, data: { name: string; description?: string }) =>
        api.put<ApiResponse<Project>>(`/projects/${id}`, data),
    delete: (id: number) => api.delete<ApiResponse<boolean>>(`/projects/${id}`),
    exportExcel: (id: number) =>
        api.get(`/projects/${id}/export`, { responseType: 'blob' }),
};

// Trips
export const tripService = {
    getByProject: (projectId: number, page = 1, pageSize = 50) =>
        api.get<ApiResponse<PagedResult<Trip>>>(`/projects/${projectId}/trips`, { params: { page, pageSize } }),
    getById: (id: number) => api.get<ApiResponse<Trip>>(`/trips/${id}`),
    create: (projectId: number, data: { name: string; description?: string; startDate?: string; endDate?: string }) =>
        api.post<ApiResponse<Trip>>(`/projects/${projectId}/trips`, data),
    update: (id: number, data: { name: string; description?: string; startDate?: string; endDate?: string }) =>
        api.put<ApiResponse<Trip>>(`/trips/${id}`, data),
    delete: (id: number) => api.delete<ApiResponse<boolean>>(`/trips/${id}`),
    exportExcel: (id: number) =>
        api.get(`/trips/${id}/export`, { responseType: 'blob' }),
};

// Days
export const dayService = {
    getByTrip: (tripId: number, page = 1, pageSize = 50) =>
        api.get<ApiResponse<PagedResult<Day>>>(`/trips/${tripId}/days`, { params: { page, pageSize } }),
    getById: (id: number) => api.get<ApiResponse<Day>>(`/days/${id}`),
    create: (tripId: number, data: { dayNumber: number; notes?: string }) =>
        api.post<ApiResponse<Day>>(`/trips/${tripId}/days`, data),
    update: (id: number, data: { dayNumber: number; notes?: string }) =>
        api.put<ApiResponse<Day>>(`/days/${id}`, data),
    delete: (id: number) => api.delete<ApiResponse<boolean>>(`/days/${id}`),
};

// Orders
export const orderService = {
    getByDay: (dayId: number, page = 1, pageSize = 50, search?: string, conTdj?: boolean | null) =>
        api.get<ApiResponse<PagedResult<Order>>>(`/days/${dayId}/orders`, {
            params: { page, pageSize, search, conTdj: conTdj === null ? undefined : conTdj },
        }),
    getById: (id: number) => api.get<ApiResponse<Order>>(`/orders/${id}`),
    create: (dayId: number, formData: FormData) =>
        api.post<ApiResponse<Order>>(`/days/${dayId}/orders`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    update: (id: number, formData: FormData) =>
        api.put<ApiResponse<Order>>(`/orders/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),
    delete: (id: number) => api.delete<ApiResponse<boolean>>(`/orders/${id}`),
    exportExcel: (dayId: number) =>
        api.get(`/days/${dayId}/orders/export`, { responseType: 'blob' }),
};
