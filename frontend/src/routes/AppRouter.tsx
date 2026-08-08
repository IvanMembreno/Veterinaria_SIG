import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ClientesPage } from '../features/clientes/ClientesPage';
import { MascotasPage } from '../features/mascotas/MascotasPage';
import { CitasPage } from '../features/citas/CitasPage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/clientes" element={<ClientesPage />} />
                    <Route path="/mascotas" element={<MascotasPage />} />
                    <Route path="/citas" element={<CitasPage />} />
                </Route>

                <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}
