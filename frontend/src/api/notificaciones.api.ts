import { api } from './axios';

export type Severidad = 'alta' | 'media' | 'info';
export type Lectura = 'diaria' | 'unica';

export interface Notificacion {
    id: string;
    tipo: string;
    severidad: Severidad;
    titulo: string;
    detalle: string;
    ruta: string;
    fecha: string;
    cantidad: number;
    lectura: Lectura;
}

export const getNotificaciones = () =>
    api.get<Notificacion[]>('/notificaciones').then((r) => r.data);
