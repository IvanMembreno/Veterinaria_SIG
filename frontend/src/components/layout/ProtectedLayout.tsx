import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import styles from './styles/sidebar.module.css';

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
                <Outlet />
            </main>
        </div>
    );
}
