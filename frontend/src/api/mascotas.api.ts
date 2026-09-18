import { api } from './axios';
import type { Cita } from './citas.api';

export interface Mascota {
    id: string;
    nombre: string;
    especie: string;
    raza?: string;
    sexo: 'MACHO' | 'HEMBRA';
    fechaNac?: string;
    peso?: number;
    imagenUrl?: string;
    clienteId: string;
    cliente?: { id: string; nombre: string };
}

export interface MascotaDetalle extends Mascota {
    citas?: Cita[];
}

export interface HistorialInsumo {
    id: string;
    cantidad: number;
    insumo: { id: string; nombre: string };
}

export interface HistorialFacturaDetalle {
    id: string;
    cantidad: number;
    precio: number;
    servicio?: { id: string; nombre: string } | null;
    insumo?: { id: string; nombre: string } | null;
}

export interface HistorialFactura {
    id: string;
    total: number;
    estado: 'PENDIENTE' | 'PAGADA';
    detalles: HistorialFacturaDetalle[];
}

export interface HistorialConsulta {
    id: string;
    diagnostico?: string | null;
    tratamiento?: string | null;
    observaciones?: string | null;
    peso?: number | null;
    temperatura?: number | null;
    createdAt: string;
    citaId: string;
    cita?: {
        id: string;
        fecha: string;
        motivo: string;
        usuario?: { id: string; nombre: string } | null;
    } | null;
    insumos: HistorialInsumo[];
    facturas: HistorialFactura[];
}

export const getMascotas = () =>
    api.get<Mascota[]>('/mascotas').then((r) => r.data);

export const getMascota = (id: string) =>
    api.get<MascotaDetalle>(`/mascotas/${id}`).then((r) => r.data);

export const getHistorialMascota = (id: string) =>
    api
        .get<HistorialConsulta[]>(`/mascotas/${id}/historial`)
        .then((r) => r.data);

export const createMascota = (formData: FormData) =>
    api
        .post('/mascotas', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);

export const updateMascota = (id: string, formData: FormData) =>
    api
        .patch(`/mascotas/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);

export const deleteMascota = (id: string) => api.delete(`/mascotas/${id}`);
