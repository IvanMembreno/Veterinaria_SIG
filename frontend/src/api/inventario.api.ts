import { api } from './axios';

export interface Insumo {
    id: string;
    nombre: string;
    lote?: string;
    fechaVenc?: string;
    stock: number;
    stockMinimo: number;
    precioUnit: number;
}

export const getInventario = () =>
    api.get<Insumo[]>('/inventario').then((r) => r.data);

export const createInsumo = (data: Omit<Insumo, 'id'>) =>
    api.post('/inventario', data).then((r) => r.data);

export const registrarEntrada = (id: string, cantidad: number, nota?: string) =>
    api
        .post(`/inventario/${id}/entrada`, { cantidad, nota })
        .then((r) => r.data);
