import { api } from './axios';

export interface Cita {
    id: string;
    mascotaId: string;
    usuarioId: string;
    fecha: string;
    estado:
        | 'PROGRAMADA'
        | 'CONFIRMADA'
        | 'ATENDIDA'
        | 'CANCELADA'
        | 'NO_ASISTIO';
    motivo: string;
    mascota?: { id: string; nombre: string };
    usuario?: { id: string; nombre: string };
}

export const getCitas = () => api.get<Cita[]>('/citas').then((r) => r.data);
export const createCita = (data: Omit<Cita, 'id' | 'estado'>) =>
    api.post('/citas', data).then((r) => r.data);
export const updateCitaEstado = (id: string, estado: string) =>
    api.patch(`/citas/${id}`, { estado }).then((r) => r.data);
