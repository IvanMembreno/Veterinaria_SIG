import type { Role } from '../features/auth/useAuthStore';

export const homeByRole: Record<Role, string> = {
    GERENTE: '/dashboard',
    RECEPCION: '/citas',
    VETERINARIO: '/citas',
    INVENTARIO: '/inventario',
};
