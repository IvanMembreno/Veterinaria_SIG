import { api } from './axios';

export interface Usuario {
    id: string;
    nombre: string;
    rol: string;
}

export const getUsuarios = () =>
    api.get<Usuario[]>('/usuarios').then((r) => r.data);
