import { api } from './axios';
import type { Role } from '../features/auth/useAuthStore';

export interface Usuario {
    id: string;
    nombre: string;
    email: string;
    rol: Role;
    activo: boolean;
}

export interface CreateUsuarioPayload {
    nombre: string;
    email: string;
    password: string;
    rol: Role;
}

export interface UpdateUsuarioPayload {
    nombre?: string;
    email?: string;
    password?: string;
    rol?: Role;
}

export const getUsuarios = () =>
    api.get<Usuario[]>('/usuarios').then((r) => r.data);

export const createUsuario = (data: CreateUsuarioPayload) =>
    api.post<Usuario>('/usuarios', data).then((r) => r.data);

export const updateUsuario = (id: string, data: UpdateUsuarioPayload) =>
    api.patch<Usuario>(`/usuarios/${id}`, data).then((r) => r.data);

export const desactivarUsuario = (id: string) =>
    api.delete(`/usuarios/${id}`).then((r) => r.data);
