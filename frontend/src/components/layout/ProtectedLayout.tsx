import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export function ProtectedLayout() {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ flex: 1, padding: 24 }}>
                <Outlet />
            </main>
        </div>
    );
}
