import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ClientesPage } from '../features/clientes/ClientesPage';
import { MascotasPage } from '../features/mascotas/MascotasPage';
import { CitasPage } from '../features/citas/CitasPage';
import { ProtectedRoute } from './ProtectedRoute';
import { ProtectedLayout } from '../components/layout/ProtectedLayout';
import { InventarioPage } from '../features/inventario/InventarioPage';
import { useAuthStore } from '../features/auth/useAuthStore';

const homeByRole: Record<string, string> = {
    GERENTE: '/dashboard',
    RECEPCION: '/citas',
    VETERINARIO: '/citas',
    INVENTARIO: '/inventario',
};

function HomeRedirect() {
    const usuario = useAuthStore((state) => state.usuario);

    if (!usuario) return <Navigate to="/login" replace />;

    const rutaDestino = homeByRole[usuario.rol] || '/login';
    return <Navigate to={rutaDestino} replace />;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<ProtectedLayout />}>
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute allowedRoles={['GERENTE']} />
                            }
                        >
                            <Route index element={<DashboardPage />} />
                        </Route>
                        <Route path="/clientes" element={<ClientesPage />} />
                        <Route path="/mascotas" element={<MascotasPage />} />
                        <Route path="/citas" element={<CitasPage />} />
                        <Route
                            path="/inventario"
                            element={
                                <ProtectedRoute
                                    allowedRoles={['GERENTE', 'INVENTARIO']}
                                />
                            }
                        >
                            <Route index element={<InventarioPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route path="/" element={<HomeRedirect />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
