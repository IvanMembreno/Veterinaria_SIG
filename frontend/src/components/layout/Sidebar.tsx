import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/useAuthStore';
import styles from './styles/sidebar.module.css';

import hamburguesa from '../../assets/actions/burger.svg';
import x from '../../assets/actions/x.svg';

import flecha from '../../assets/arrow.svg';
import portafolio from '../../assets/portfolio.svg';
import estetoscopio from '../../assets/estetoscopio.svg';

import dashboard from '../../assets/dashboard.svg';
import clientes from '../../assets/clients.svg';
import mascotas from '../../assets/pets.svg';
import citas from '../../assets/appointment.svg';
import inventario from '../../assets/inventory.svg';

const links = [
    {
        to: '/dashboard',
        label: 'Dashboard',
        icon: dashboard,
        roles: ['GERENTE'],
    },
    {
        to: '/clientes',
        label: 'Clientes',
        icon: clientes,
        roles: ['GERENTE', 'RECEPCION'],
    },
    {
        to: '/mascotas',
        label: 'Mascotas',
        icon: mascotas,
        roles: ['GERENTE', 'RECEPCION', 'VETERINARIO'],
    },
    {
        to: '/citas',
        label: 'Citas',
        icon: citas,
        roles: ['GERENTE', 'RECEPCION', 'VETERINARIO'],
    },
    {
        to: '/inventario',
        label: 'Inventario',
        icon: inventario,
        roles: ['GERENTE', 'INVENTARIO'],
    },
];

export function Sidebar() {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav
            className={`${styles.sidebarNav} ${isOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`}
        >
            <div className={styles.brandContainer}>
                <button onClick={toggleSidebar} className={styles.toggleBtn}>
                    {isOpen ? (
                        <img src={x} alt="" className={styles.burger} />
                    ) : (
                        <img
                            src={hamburguesa}
                            alt=""
                            className={styles.burger}
                        />
                    )}
                </button>
                {isOpen && (
                    <div className={styles.sidebarBrand}>
                        <span className={styles.subBrand}>VETERINARIA</span>
                        <h2 className={styles.mainBrand}>La Garrita Feliz</h2>
                    </div>
                )}
            </div>

            <ul className={styles.linksList}>
                {links
                    .filter((l) => usuario && l.roles.includes(usuario.rol))
                    .map((l) => {
                        const isActive = location.pathname === l.to;
                        return (
                            <li key={l.to} className={styles.linkItem}>
                                <Link
                                    to={l.to}
                                    className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                                >
                                    {!isOpen && (
                                        <span
                                            className={styles.navIconContainer}
                                        >
                                            <img
                                                src={l.icon}
                                                alt=""
                                                className={styles.navIconImg}
                                            />
                                        </span>
                                    )}
                                    {isOpen && (
                                        <span className={styles.linkLabel}>
                                            {l.label}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
            </ul>

            <div className={styles.userCard}>
                <div className={styles.avatarPlace}>
                    {usuario?.rol === 'VETERINARIO' ? (
                        <img
                            src={estetoscopio}
                            alt=""
                            className={styles.avatarImg}
                        />
                    ) : (
                        <img
                            src={portafolio}
                            alt=""
                            className={styles.avatarImg}
                        />
                    )}
                </div>
                {isOpen && (
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>
                            Hola, {usuario?.nombre}
                        </p>
                        <span className={styles.userRol}>{usuario?.rol}</span>
                    </div>
                )}
                {isOpen && (
                    <button
                        onClick={handleLogout}
                        className={styles.logoutBtn}
                        title="Cerrar sesión"
                    >
                        <img
                            src={flecha}
                            alt=""
                            className={styles.logoutIconImg}
                        />
                    </button>
                )}
            </div>
        </nav>
    );
}
