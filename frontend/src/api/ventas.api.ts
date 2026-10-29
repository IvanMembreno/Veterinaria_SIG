import { api } from './axios';

export type TipoItemVenta = 'servicio' | 'insumo';

export interface VentaItem {
    tipo: TipoItemVenta;
    id: string;
    cantidad: number;
}

export interface CreateVentaPayload {
    items: VentaItem[];
    metodoPago?: string;
}

export interface FacturaDetalle {
    id: string;
    cantidad: number;
    precio: number;
    servicioId?: string | null;
    insumoId?: string | null;
    servicio?: { id: string; nombre: string } | null;
    insumo?: { id: string; nombre: string } | null;
}

export interface Factura {
    id: string;
    total: number;
    fecha: string;
    estado: 'PENDIENTE' | 'PAGADA';
    metodoPago?: string | null;
    consultaId?: string | null;
    detalles: FacturaDetalle[];
}

export const crearVenta = (data: CreateVentaPayload) =>
    api.post<Factura>('/ventas', data).then((r) => r.data);
