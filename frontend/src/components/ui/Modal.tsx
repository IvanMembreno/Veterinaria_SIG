import { useEffect } from 'react';
import styles from './styles/modal.module.css';
import x from '../../assets/actions/x.svg';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        document.body.style.overflow = 'hidden';
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
                <div className={styles.panelHeader}>
                    <h3 className={styles.panelTitle}>{title}</h3>
                    <button
                        className={styles.closeBtn}
                        onClick={onClose}
                        aria-label="Cerrar"
                    >
                        <img src={x} alt="" className={styles.closeIcon} />
                    </button>
                </div>
                <div className={styles.panelBody}>{children}</div>
            </div>
        </div>
    );
}
