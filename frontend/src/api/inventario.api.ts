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

export type TipoMovimiento = 'ENTRADA' | 'SALIDA_CONSULTA' | 'AJUSTE' | 'VENTA';

export interface MovimientoInventario {
    id: string;
    tipo: TipoMovimiento;
    cantidad: number;
    fecha: string;
    nota?: string | null;
}

export const darDeBajaInsumo = (id: string) =>
    api.patch<Insumo>(`/inventario/${id}/baja`).then((r) => r.data);

export const getMovimientos = (id: string) =>
    api
        .get<MovimientoInventario[]>(`/inventario/${id}/movimientos`)
        .then((r) => r.data);

export interface EntradaPayload {
    cantidad: number;
    nota?: string;
    // Obligatorios al reabastecer un producto vencido (lote y vencimiento nuevos).
    lote?: string;
    fechaVenc?: string;
}

export const registrarEntrada = (id: string, datos: EntradaPayload) =>
    api.post<Insumo>(`/inventario/${id}/entrada`, datos).then((r) => r.data);
