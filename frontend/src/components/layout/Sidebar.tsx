import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';

const links = [
    { to: '/dashboard'  , label: 'Dashboard'    , roles: ['GERENTE'] },
    { to: '/clientes'   , label: 'Clientes'     , roles: ['GERENTE', 'RECEPCION'] },
    { to: '/mascotas'   , label: 'Mascotas'     , roles: ['GERENTE', 'RECEPCION', 'VETERINARIO'] },
    { to: '/citas'      , label: 'Citas'        , roles: ['GERENTE', 'RECEPCION', 'VETERINARIO'] },
    { to: '/inventario' , label: 'Inventario'   , roles: ['GERENTE', 'INVENTARIO'] },
]

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
                {links
                    .filter((l) => usuario && l.roles.includes(usuario.rol))
                    .map((l) => (
                        <li key={l.to}><Link to={l.to}>{l.label}</Link></li>
                    ))}
            </ul>
            <button onClick={handleLogout}>Cerrar sesión</button>
        </nav>
    );
}
