import type { Mascota } from '../../../api/mascotas.api';
import type { TipoRecordatorio } from '../../../api/recordatorios.api';
import { Modal } from '../../../components/ui/Modal';
import { Autocomplete } from '../../../components/ui/Autocomplete';
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
    isEditing?: boolean;
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
    isEditing = false,
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
            title={
                isEditing
                    ? 'Editar Recordatorio'
                    : 'Registrar Nuevo Recordatorio'
            }
        >
            <form onSubmit={onSubmit} className={styles.formGrid}>
                <div className={styles.field}>
                    <label htmlFor="select-mascota">Mascota</label>
                    <Autocomplete
                        id="select-mascota"
                        placeholder="Escribe el nombre de la mascota"
                        options={(mascotas ?? []).map((m) => ({
                            value: m.id,
                            label: m.nombre,
                            hint: m.cliente?.nombre,
                        }))}
                        value={form.mascotaId}
                        onChange={(mascotaId) => setForm({ ...form, mascotaId })}
                        disabled={isEditing}
                        required
                    />
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
                    {isSaving
                        ? 'Guardando...'
                        : isEditing
                          ? 'Guardar Cambios'
                          : 'Crear Recordatorio'}
                </button>
            </form>
        </Modal>
    );
}
