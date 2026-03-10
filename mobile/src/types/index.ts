// API response types matching backend DTOs

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    errors?: string[];
}

export interface PagedResult<T> {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface AuthResponse {
    token: string;
    email: string;
    expiresAt: string;
}

export interface Project {
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    tripCount: number;
}

export interface Trip {
    id: number;
    projectId: number;
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
    dayCount: number;
}

export interface Day {
    id: number;
    tripId: number;
    dayNumber: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    orderCount: number;
}

export type RedSocial = 'TikTok' | 'Instagram' | 'WhatsApp' | 'Facebook' | 'Otro';
export const RED_SOCIAL_OPTIONS: { label: RedSocial; value: number }[] = [
    { label: 'TikTok', value: 0 },
    { label: 'Instagram', value: 1 },
    { label: 'WhatsApp', value: 2 },
    { label: 'Facebook', value: 3 },
    { label: 'Otro', value: 4 },
];

export interface Order {
    id: number;
    dayId: number;
    nombrePersona: string;
    producto?: string;
    descripcion?: string;
    redSocial: RedSocial;
    usuarioRedSocial?: string;
    fotoBase64?: string;
    usuarioAsignadoFuturo?: string;
    createdAt: string;
    updatedAt: string;
}

// Navigation types
export type RootStackParamList = {
    Auth: undefined;
    App: undefined;
};

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type AppStackParamList = {
    Projects: undefined;
    ProjectDetail: { projectId: number; projectName: string };
    TripDetail: { tripId: number; tripName: string };
    DayDetail: { dayId: number; dayNumber: number };
    OrderForm: { dayId: number; order?: Order };
};
