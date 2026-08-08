import { api } from './axios';

export interface Servicio {
    id: string;
    nombre: string;
    precio: number;
}
export const getServicios = () =>
    api.get<Servicio[]>('/servicios').then((r) => r.data);
