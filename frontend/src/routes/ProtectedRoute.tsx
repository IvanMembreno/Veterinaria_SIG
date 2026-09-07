import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../features/auth/useAuthStore';
import type { Role } from '../features/auth/useAuthStore';
import { homeByRole } from './homeByRole';

interface Props {
    allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: Props) {
    const { token, usuario } = useAuthStore();

    if (!token) return <Navigate to="/login" replace />;
    if (allowedRoles && usuario && !allowedRoles.includes(usuario.rol)) {
        const rutaDestino = homeByRole[usuario.rol] || '/login';
        return <Navigate to={rutaDestino} replace />;
    }
    return <Outlet />;
}
