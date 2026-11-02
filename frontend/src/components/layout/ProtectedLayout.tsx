import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { NotificationBell } from './NotificationBell';
import styles from './styles/sidebar.module.css';
import topBarStyles from './styles/notificaciones.module.css';

export function ProtectedLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className={styles.layout}>
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            <main
                className={`${styles.mainContent} ${isSidebarOpen ? styles.mainContentShifted : ''}`}
            >
                <div className={topBarStyles.topBar}>
                    <NotificationBell />
                </div>
                <Outlet />
            </main>
        </div>
    );
}
