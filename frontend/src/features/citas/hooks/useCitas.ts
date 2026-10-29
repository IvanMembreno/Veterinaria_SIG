import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getCitas,
    createCita,
    updateCita,
    updateCitaEstado,
    type Cita,
    type UpdateCitaPayload,
} from '../../../api/citas.api';
import { getMascotas } from '../../../api/mascotas.api';
import { getUsuarios } from '../../../api/usuarios.api';
import { useAuthStore } from '../../auth/useAuthStore';

const initialForm = { mascotaId: '', usuarioId: '', fecha: '', motivo: '' };

// Horario laboral 07:00–17:00 en bloques de 30 min; la última cita inicia a las 16:30.
const PRIMER_BLOQUE = 7 * 60;
const ULTIMO_BLOQUE = 16 * 60 + 30;
const DURACION_BLOQUE = 30;

const pad = (n: number) => String(n).padStart(2, '0');

const minutosAHora = (minutos: number) =>
    `${pad(Math.floor(minutos / 60))}:${pad(minutos % 60)}`;

const horaAMinutos = (hora: string) => {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
};

const fechaLocal = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const HORAS_LABORALES = Array.from(
    { length: (ULTIMO_BLOQUE - PRIMER_BLOQUE) / DURACION_BLOQUE + 1 },
    (_, i) => minutosAHora(PRIMER_BLOQUE + i * DURACION_BLOQUE),
);

// Convierte una fecha ISO al formato "YYYY-MM-DDTHH:mm" local que usa el formulario.
function toDatetimeLocal(iso: string) {
    const d = new Date(iso);
    return `${fechaLocal(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const hoyLocal = () => fechaLocal(new Date());

const mananaLocal = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return fechaLocal(d);
};

// Un bloque de hoy ya pasó si su hora de inicio es <= a la hora actual.
function bloqueYaPaso(hora: string) {
    const ahora = new Date();
    const minutosActuales =
        ahora.getHours() * 60 +
        ahora.getMinutes() +
        ahora.getSeconds() / 60 +
        ahora.getMilliseconds() / 60000;
    return horaAMinutos(hora) <= minutosActuales;
}

// Primer bloque de hoy que aún no pasó, o null si ya no quedan.
const siguienteBloqueHoy = () =>
    HORAS_LABORALES.find((h) => !bloqueYaPaso(h)) ?? null;

// Siguiente bloque disponible: hoy, o mañana a las 07:00 si ya no quedan bloques.
function fechaPorDefecto() {
    const bloque = siguienteBloqueHoy();
    return bloque
        ? `${hoyLocal()}T${bloque}`
        : `${mananaLocal()}T${HORAS_LABORALES[0]}`;
}

// Fecha mínima seleccionable: hoy si aún quedan bloques, si no mañana.
const fechaMinimaNueva = () =>
    siguienteBloqueHoy() ? hoyLocal() : mananaLocal();

const nuevoForm = () => ({ ...initialForm, fecha: fechaPorDefecto() });

export interface CitasFiltros {
    estado: '' | Cita['estado'];
    desde: string;
    hasta: string;
}

const filtrosIniciales: CitasFiltros = { estado: '', desde: '', hasta: '' };

export type VistaCitas = 'lista' | 'calendario';

export function useCitas() {
    const queryClient = useQueryClient();
    const { data: citas, isLoading } = useQuery({
        queryKey: ['citas'],
        queryFn: getCitas,
    });
    const { data: mascotas } = useQuery({
        queryKey: ['mascotas'],
        queryFn: getMascotas,
    });
    const { data: usuarios } = useQuery({
        queryKey: ['usuarios'],
        queryFn: getUsuarios,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario
        ? ['GERENTE', 'RECEPCION'].includes(usuario.rol)
        : false;

    const puedeAtender = usuario
        ? ['GERENTE', 'VETERINARIO'].includes(usuario.rol)
        : false;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(nuevoForm);
    const [fechaMinima, setFechaMinima] = useState(fechaMinimaNueva);
    // Fecha/hora con la que se abrió la cita en edición; null en modo nuevo.
    const [fechaOriginal, setFechaOriginal] = useState<string | null>(null);
    const [errorHorario, setErrorHorario] = useState<string | null>(null);
    const [citaParaAtender, setCitaParaAtender] = useState<string | null>(null);

    const [filtros, setFiltros] = useState<CitasFiltros>(filtrosIniciales);
    const [vista, setVista] = useState<VistaCitas>('lista');

    const limpiarFiltros = () => setFiltros(filtrosIniciales);

    const citasFiltradas = useMemo(() => {
        if (!citas) return citas;
        return citas.filter((c) => {
            if (filtros.estado && c.estado !== filtros.estado) return false;

            const fechaCita = new Date(c.fecha);
            if (filtros.desde && fechaCita < new Date(filtros.desde)) {
                return false;
            }
            if (filtros.hasta) {
                const hasta = new Date(filtros.hasta);
                hasta.setHours(23, 59, 59, 999);
                if (fechaCita > hasta) return false;
            }
            return true;
        });
    }, [citas, filtros]);

    const veterinarios = usuarios?.filter((u) => u.rol === 'VETERINARIO');

    const limpiarErrores = () => {
        setErrorHorario(null);
        createMutation.reset();
        updateMutation.reset();
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFechaOriginal(null);
        limpiarErrores();
        setForm(nuevoForm());
    };

    const createMutation = useMutation({
        mutationFn: createCita,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citas'] });
            cerrarModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateCitaPayload }) =>
            updateCita(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['citas'] });
            cerrarModal();
        },
    });

    const cancelarMutation = useMutation({
        mutationFn: (id: string) => updateCitaEstado(id, 'CANCELADA'),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['citas'] }),
    });

    const abrirNuevo = () => {
        setEditingId(null);
        setFechaOriginal(null);
        limpiarErrores();
        setFechaMinima(fechaMinimaNueva());
        setForm(nuevoForm());
        setIsModalOpen(true);
    };

    const abrirEdicion = (cita: Cita) => {
        const fecha = toDatetimeLocal(cita.fecha);
        const minima = fechaMinimaNueva();
        setEditingId(cita.id);
        setFechaOriginal(fecha);
        limpiarErrores();
        // Una cita vencida conserva su fecha como mínimo para poder guardarse sin cambiarla.
        setFechaMinima(fecha.slice(0, 10) < minima ? fecha.slice(0, 10) : minima);
        setForm({
            mascotaId: cita.mascotaId,
            usuarioId: cita.usuarioId,
            fecha,
            motivo: cita.motivo,
        });
        setIsModalOpen(true);
    };

    const fechaForm = form.fecha.slice(0, 10);
    const horaForm = form.fecha.slice(11, 16);

    // Si la cita editada tiene una hora fuera de los bloques, se agrega para que se vea.
    const horasDisponibles =
        horaForm && !HORAS_LABORALES.includes(horaForm)
            ? [...HORAS_LABORALES, horaForm].sort()
            : HORAS_LABORALES;

    // Aviso en vivo con las citas ya cargadas; el backend hace la validación definitiva.
    const advertenciaChoque = useMemo(() => {
        if (!citas || !form.fecha) return null;
        const inicio = new Date(form.fecha).getTime();
        if (Number.isNaN(inicio)) return null;
        const choque = citas.find(
            (c) =>
                c.id !== editingId &&
                c.estado !== 'CANCELADA' &&
                c.estado !== 'NO_ASISTIO' &&
                Math.abs(new Date(c.fecha).getTime() - inicio) <
                    DURACION_BLOQUE * 60 * 1000 &&
                ((!!form.usuarioId && c.usuarioId === form.usuarioId) ||
                    (!!form.mascotaId && c.mascotaId === form.mascotaId)),
        );
        if (!choque) return null;
        const hora = new Date(choque.fecha).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        });
        return choque.usuarioId === form.usuarioId
            ? `El veterinario ya tiene una cita a esa hora (${hora}).`
            : `La mascota ya tiene una cita a esa hora (${hora}).`;
    }, [citas, editingId, form.fecha, form.usuarioId, form.mascotaId]);

    const sinBloquesHoy = siguienteBloqueHoy() === null;

    // En edición, la fecha/hora original de la cita sigue siendo seleccionable aunque ya pasó.
    const esHoraDeshabilitada = (hora: string) =>
        fechaForm === hoyLocal() &&
        bloqueYaPaso(hora) &&
        `${fechaForm}T${hora}` !== fechaOriginal;

    const setFechaForm = (fecha: string) => {
        setErrorHorario(null);
        let nueva = `${fecha}T${horaForm}`;
        // Si se elige hoy con una hora que ya pasó, se ajusta al siguiente bloque libre.
        if (
            fecha === hoyLocal() &&
            bloqueYaPaso(horaForm) &&
            nueva !== fechaOriginal
        ) {
            const bloque = siguienteBloqueHoy();
            nueva = bloque
                ? `${fecha}T${bloque}`
                : `${mananaLocal()}T${HORAS_LABORALES[0]}`;
        }
        setForm({ ...form, fecha: nueva });
    };

    const setHoraForm = (hora: string) => {
        setErrorHorario(null);
        setForm({ ...form, fecha: `${fechaForm}T${hora}` });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const minutos = horaForm ? horaAMinutos(horaForm) : NaN;
        if (
            !fechaForm ||
            !(minutos >= PRIMER_BLOQUE && minutos <= ULTIMO_BLOQUE)
        ) {
            setErrorHorario(
                'La hora debe estar dentro del horario laboral (07:00 a 17:00; última cita a las 16:30).',
            );
            return;
        }
        // Al editar, solo se exige fecha futura si cambió la fecha u hora.
        if (
            form.fecha !== fechaOriginal &&
            new Date(form.fecha).getTime() < Date.now()
        ) {
            setErrorHorario(
                'No se puede programar una cita en una fecha u hora pasada.',
            );
            return;
        }
        setErrorHorario(null);
        const data = { ...form, fecha: new Date(form.fecha).toISOString() };
        if (editingId) {
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return {
        citas: citasFiltradas,
        totalCitas: citas?.length ?? 0,
        mascotas,
        veterinarios,
        isLoading,
        puedeCrear,
        puedeAtender,
        isModalOpen,
        editingId,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        form,
        setForm,
        fechaForm,
        horaForm,
        setFechaForm,
        setHoraForm,
        fechaMinima,
        horasDisponibles,
        errorHorario,
        advertenciaChoque,
        sinBloquesHoy,
        esHoraDeshabilitada,
        citaParaAtender,
        setCitaParaAtender,
        cancelarMutation,
        handleSubmit,
        isSaving: createMutation.isPending || updateMutation.isPending,
        isError: createMutation.isError || updateMutation.isError,
        error: createMutation.error ?? updateMutation.error,
        filtros,
        setFiltros,
        limpiarFiltros,
        vista,
        setVista,
    };
}
