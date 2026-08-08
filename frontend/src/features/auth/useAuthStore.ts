import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'GERENTE' | 'VETERINARIO' | 'RECEPCION' | 'INVENTARIO';

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    rol: Role;
}

interface AuthState {
    token: string | null;
    usuario: Usuario | null;
    login: (token: string, usuario: Usuario) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            usuario: null,
            login: (token, usuario) => set({ token, usuario }),
            logout: () => set({ token: null, usuario: null }),
        }),
        { name: 'auth-storage' },
    ),
);
