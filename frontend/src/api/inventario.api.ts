import { api } from './axios';

export interface Insumo {
    id: string;
    nombre: string;
    stock: number;
}
export const getInventario = () =>
    api.get<Insumo[]>('/inventario').then((r) => r.data);
