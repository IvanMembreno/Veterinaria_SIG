import type { Mascota } from '../../../api/mascotas.api';
import type { TipoRecordatorio } from '../../../api/recordatorios.api';
import { Modal } from '../../../components/ui/Modal';
import { getErrorMessage } from '../../../utils/getErrorMessage';
import styles from '../styles/recordatorios.module.css';

interface FormRecordatorio {
    mascotaId: string;
    tipo: TipoRecordatorio;
    fechaProgramada: string;
    nota: string;
}

interface ModalNuevoRecordatorioProps {
    isOpen: boolean;
    onClose: () => void;
    mascotas?: Mascota[];
    form: FormRecordatorio;
    setForm: (form: FormRecordatorio) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSaving: boolean;
    isError: boolean;
    error: unknown;
}

export function ModalNuevoRecordatorio({
    isOpen,
    onClose,
    mascotas,
    form,
    setForm,
    onSubmit,
    isSaving,
    isError,
    error,
}: ModalNuevoRecordatorioProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Registrar Nuevo Recordatorio"
        >
            <form onSubmit={onSubmit} className={styles.formGrid}>
                <div className={styles.field}>
                    <label htmlFor="select-mascota">Mascota</label>
                    <select
                        id="select-mascota"
                        value={form.mascotaId}
                        onChange={(e) =>
                            setForm({ ...form, mascotaId: e.target.value })
                        }
                        required
                    >
                        <option value="">-- Mascota --</option>
                        {mascotas?.map((m) => (
                            <option key={m.id} value={m.id}>
                                {m.nombre}
                                {m.cliente?.nombre
                                    ? ` (${m.cliente.nombre})`
                                    : ''}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formRow}>
                    <div className={styles.field}>
                        <label htmlFor="select-tipo">Tipo</label>
                        <select
                            id="select-tipo"
                            value={form.tipo}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    tipo: e.target.value as TipoRecordatorio,
                                })
                            }
                        >
                            <option value="VACUNA">Vacuna</option>
                            <option value="CONTROL">Control</option>
                        </select>
                    </div>
                    <div className={styles.field}>
                        <label htmlFor="input-fecha">Fecha Programada</label>
                        <input
                            id="input-fecha"
                            type="date"
                            value={form.fechaProgramada}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    fechaProgramada: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                </div>

                <div className={styles.field}>
                    <label htmlFor="input-nota">Nota (opcional)</label>
                    <input
                        id="input-nota"
                        placeholder="Ej: Vacuna antirrábica anual"
                        value={form.nota}
                        onChange={(e) =>
                            setForm({ ...form, nota: e.target.value })
                        }
                    />
                </div>

                {isError && (
                    <p className={styles.errorMsg}>
                        {getErrorMessage(
                            error,
                            'No se pudo guardar el recordatorio.',
                        )}
                    </p>
                )}

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isSaving}
                >
                    {isSaving ? 'Guardando...' : 'Crear Recordatorio'}
                </button>
            </form>
        </Modal>
    );
}
