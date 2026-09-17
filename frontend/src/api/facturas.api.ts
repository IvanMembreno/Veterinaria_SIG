import { api } from './axios';

export type EstadoFactura = 'PENDIENTE' | 'PAGADA';

export interface FacturaDetalleItem {
    id: string;
    cantidad: number;
    precio: number;
    servicioId?: string | null;
    insumoId?: string | null;
    servicio?: { id: string; nombre: string } | null;
    insumo?: { id: string; nombre: string } | null;
}

export interface ConsultaResumen {
    id: string;
    diagnostico?: string | null;
    tratamiento?: string | null;
    observaciones?: string | null;
    createdAt: string;
    citaId: string;
    cita?: {
        id: string;
        fecha: string;
        motivo: string;
        mascota?: {
            id: string;
            nombre: string;
            cliente?: { id: string; nombre: string } | null;
        } | null;
    } | null;
}

export interface Factura {
    id: string;
    total: number;
    fecha: string;
    estado: EstadoFactura;
    metodoPago?: string | null;
    consultaId?: string | null;
    consulta?: ConsultaResumen | null;
    detalles: FacturaDetalleItem[];
}

export interface FacturasFiltros {
    desde?: string;
    hasta?: string;
    clienteId?: string;
    estado?: EstadoFactura;
}

export const getFacturas = (filtros: FacturasFiltros = {}) =>
    api.get<Factura[]>('/facturas', { params: filtros }).then((r) => r.data);

export const getFactura = (id: string) =>
    api.get<Factura>(`/facturas/${id}`).then((r) => r.data);

export const pagarFactura = (id: string, metodoPago: string) =>
    api
        .patch<Factura>(`/facturas/${id}/pagar`, { metodoPago })
        .then((r) => r.data);

export function clienteDeFactura(factura: Factura): string | null {
    return factura.consulta?.cita?.mascota?.cliente?.nombre ?? null;
}
