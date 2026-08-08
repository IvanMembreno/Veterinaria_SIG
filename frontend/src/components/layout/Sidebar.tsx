import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';

export function Sidebar() {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav
            style={{
                width: 200,
                padding: 16,
                borderRight: '1px solid #ccc',
                minHeight: '100vh',
            }}
        >
            <p>Hola, {usuario?.nombre}</p>
            <p>
                <small>{usuario?.rol}</small>
            </p>
            <ul
                style={{
                    listStyle: 'none',
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                }}
            >
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>
                <li>
                    <Link to="/clientes">Clientes</Link>
                </li>
                <li>
                    <Link to="/mascotas">Mascotas</Link>
                </li>
                <li>
                    <Link to="/citas">Citas</Link>
                </li>
            </ul>
            <button onClick={handleLogout}>Cerrar sesión</button>
        </nav>
    );
}
