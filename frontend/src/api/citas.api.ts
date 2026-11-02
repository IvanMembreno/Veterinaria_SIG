import { api } from './axios';
import type {
    EnvioWhatsappRespuesta,
    RecordatorioCliente,
} from './recordatorios.api';

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
    mascota?: {
        id: string;
        nombre: string;
        cliente?: Omit<RecordatorioCliente, 'email'> | null;
    };
    usuario?: { id: string; nombre: string };
}

export const getCitas = () => api.get<Cita[]>('/citas').then((r) => r.data);
export const createCita = (data: Omit<Cita, 'id' | 'estado'>) =>
    api.post<Cita>('/citas', data).then((r) => r.data);
export type UpdateCitaPayload = Partial<
    Pick<Cita, 'mascotaId' | 'usuarioId' | 'fecha' | 'motivo'>
>;

export const updateCita = (id: string, data: UpdateCitaPayload) =>
    api.patch<Cita>(`/citas/${id}`, data).then((r) => r.data);
export const updateCitaEstado = (id: string, estado: string) =>
    api.patch<Cita>(`/citas/${id}`, { estado }).then((r) => r.data);

export type TipoAvisoCita = 'AGENDADA' | 'REPROGRAMADA' | 'CANCELADA';

export const avisarCitaWhatsapp = (id: string, tipo: TipoAvisoCita) =>
    api
        .post<EnvioWhatsappRespuesta>(`/citas/${id}/avisar-whatsapp`, { tipo })
        .then((r) => r.data);
