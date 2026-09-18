import { api } from './axios';

export type TipoRecordatorio = 'VACUNA' | 'CONTROL';
export type EstadoRecordatorio = 'PENDIENTE' | 'ENVIADO' | 'COMPLETADO';

export interface RecordatorioCliente {
    id: string;
    nombre: string;
    telefono: string;
    email?: string | null;
}

export interface RecordatorioMascota {
    id: string;
    nombre: string;
    especie: string;
    cliente?: RecordatorioCliente | null;
}

export interface Recordatorio {
    id: string;
    tipo: TipoRecordatorio;
    fechaProgramada: string;
    estado: EstadoRecordatorio;
    nota?: string | null;
    contactoEnviado?: string | null;
    createdAt: string;
    mascotaId: string;
    mascota?: RecordatorioMascota;
}

export interface RecordatoriosFiltros {
    mascotaId?: string;
    estado?: EstadoRecordatorio;
}

export interface CreateRecordatorioPayload {
    mascotaId: string;
    tipo: TipoRecordatorio;
    fechaProgramada: string;
    nota?: string;
}

export interface UpdateRecordatorioPayload {
    mascotaId?: string;
    tipo?: TipoRecordatorio;
    fechaProgramada?: string;
    nota?: string;
    estado?: EstadoRecordatorio;
    contactoEnviado?: string;
}

export const getRecordatorios = (filtros: RecordatoriosFiltros = {}) =>
    api
        .get<Recordatorio[]>('/recordatorios', { params: filtros })
        .then((r) => r.data);

export const createRecordatorio = (data: CreateRecordatorioPayload) =>
    api.post<Recordatorio>('/recordatorios', data).then((r) => r.data);

export const updateRecordatorio = (
    id: string,
    data: UpdateRecordatorioPayload,
) => api.patch<Recordatorio>(`/recordatorios/${id}`, data).then((r) => r.data);

export const deleteRecordatorio = (id: string) =>
    api.delete(`/recordatorios/${id}`);
