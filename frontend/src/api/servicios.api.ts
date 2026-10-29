import { api } from './axios';

export interface Servicio {
    id: string;
    nombre: string;
    precio: number;
    activo: boolean;
}

export interface CreateServicioPayload {
    nombre: string;
    precio: number;
    activo?: boolean;
}

export type UpdateServicioPayload = Partial<CreateServicioPayload>;

export const getServicios = () =>
    api.get<Servicio[]>('/servicios').then((r) => r.data);

export const createServicio = (data: CreateServicioPayload) =>
    api.post<Servicio>('/servicios', data).then((r) => r.data);

export const updateServicio = (id: string, data: UpdateServicioPayload) =>
    api.patch<Servicio>(`/servicios/${id}`, data).then((r) => r.data);

export const desactivarServicio = (id: string) =>
    api.delete(`/servicios/${id}`).then((r) => r.data);
