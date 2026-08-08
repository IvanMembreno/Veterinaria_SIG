import { api } from './axios';

export const createConsulta = (data: unknown) =>
    api.post('/consultas', data).then((r) => r.data);
