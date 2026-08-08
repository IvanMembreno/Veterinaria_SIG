import { api } from './axios';

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

export const getMascotas = () =>
    api.get<Mascota[]>('/mascotas').then((r) => r.data);

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
