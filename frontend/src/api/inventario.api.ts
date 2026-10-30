import { api } from './axios';

export interface Insumo {
    id: string;
    nombre: string;
    lote?: string;
    fechaVenc?: string;
    stock: number;
    stockMinimo: number;
    precioUnit: number;
    imagenUrl?: string | null;
}

export const getInventario = () =>
    api.get<Insumo[]>('/inventario').then((r) => r.data);

export const createInsumo = (formData: FormData) =>
    api
        .post('/inventario', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);

export const updateInsumo = (id: string, formData: FormData) =>
    api
        .patch<Insumo>(`/inventario/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then((r) => r.data);

export const registrarEntrada = (id: string, cantidad: number, nota?: string) =>
    api
        .post(`/inventario/${id}/entrada`, { cantidad, nota })
        .then((r) => r.data);
