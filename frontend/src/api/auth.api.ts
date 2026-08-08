import { api } from './axios';

export interface LoginPayload {
    email: string;
    password: string;
}

export const loginRequest = (data: LoginPayload) =>
    api.post('/auth/login', data).then((res) => res.data)