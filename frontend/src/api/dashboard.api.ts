import { api } from './axios';

export interface AlertaStock {
    id: string;
    nombre: string;
    stock: number;
    stockMinimo: number;
}

export interface AlertaVencimiento {
    id: string;
    nombre: string;
    lote: string | null;
    fechaVenc: string;
    stock: number;
}

export interface ResumenDashboard {
    ingresosPorServicio: {
        servicio: string;
        totalIngresos: number;
        vecesVendido: number;
    }[];
    ingresosPorMes: { mes: string; total: number }[];
    ingresosPorMetodoPago: { metodo: string; total: number }[];
    consultasPorVeterinario: { nombre: string; total: number }[];
    mascotasPorEspecie: { especie: string; total: number }[];
    ticketPromedio: { ticketPromedio: number; totalFacturas: number };
    ocupacionAgenda: {
        totalCitas: number;
        atendidas: number;
        noAsistio: number;
        canceladas: number;
        tasaAsistencia: number;
        tasaAusentismo: number;
    };
    alertasStockBajo: AlertaStock[];
    alertasVencimiento: AlertaVencimiento[];
}

export const getResumenDashboard = () =>
    api.get<ResumenDashboard>('/dashboard/resumen').then((r) => r.data);