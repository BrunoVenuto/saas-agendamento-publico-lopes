export enum Niche {
    SALON = 'SALON',
    CLINIC = 'CLINIC',
    PETSHOP = 'PETSHOP',
    PERSONAL = 'PERSONAL'
}

export enum Role {
    TENANT_ADMIN = 'TENANT_ADMIN',
    STAFF = 'STAFF'
}

export enum AppointmentStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    COMPLETED = 'COMPLETED'
}

export interface Tenant {
    id: string;
    name: string;
    slug: string;
    primary_color: string;
    logo_url?: string;
    niche: Niche;
}

export interface Profile {
    id: string;
    tenant_id: string;
    full_name: string;
    role: Role;
}

export interface Service {
    id: string;
    tenant_id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    is_active: boolean;
}

export interface Professional {
    id: string;
    tenant_id: string;
    name: string;
    whatsapp: string;
    bio?: string;
    avatar_url?: string;
    is_active: boolean;
    services?: string[]; // IDs of services they perform
}

export interface Availability {
    id: string;
    professional_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
    is_active: boolean;
}

export interface Booking {
    id: string;
    tenant_id: string;
    service_id: string;
    professional_id: string;
    client_name: string;
    client_whatsapp: string;
    start_time: string;
    end_time: string;
    status: AppointmentStatus;
}

export interface TimeSlot {
    start: Date;
    end: Date;
    available: boolean;
}
