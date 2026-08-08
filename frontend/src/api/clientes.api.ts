import { api } from './axios';

export interface Cliente {
    id: string;
    nombre: string;
    telefono: string;
    email?: string;
    direccion?: string;
}

export const getClientes = () =>
    api.get<Cliente[]>('/clientes').then((r) => r.data);

export const createCliente = (data: Omit<Cliente, 'id'>) =>
    api.post('/clientes', data).then((r) => r.data);

export const updateCliente = (id: string, data: Partial<Cliente>) =>
    api.patch(`/clientes/${id}`, data).then((r) => r.data);

export const deleteCliente = (id: string) => api.delete(`/clientes/${id}`);
