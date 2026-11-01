import { useLayoutEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    type Cliente,
} from '../../../api/clientes.api';
import { useAuthStore } from '../../auth/useAuthStore';
import {
    formatearTelefonoInput,
    normalizarTelefono,
    telefonoParaEditar,
} from '../../../utils/telefono';

const initialForm = {
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    aceptaRecordatorios: false,
};

const esDigito = (c: string | undefined) => c !== undefined && /\d/.test(c);
const esSeparador = (c: string | undefined) => c === '-' || c === ' ';

// Posición del cursor en el texto formateado que conserva los mismos dígitos a su izquierda.
function posicionCursor(antes: string, formateado: string) {
    const digitos = antes.replace(/\D/g, '').length;
    if (digitos === 0) {
        return antes.includes('+') && formateado.startsWith('+') ? 1 : 0;
    }
    let vistos = 0;
    for (let i = 0; i < formateado.length; i++) {
        if (esDigito(formateado[i]) && ++vistos === digitos) return i + 1;
    }
    return formateado.length;
}

export function useClientes() {
    const queryClient = useQueryClient();
    const { data: clientes, isLoading } = useQuery({
        queryKey: ['clientes'],
        queryFn: getClientes,
    });

    const usuario = useAuthStore((s) => s.usuario);
    const puedeCrear = usuario
        ? ['GERENTE', 'RECEPCION'].includes(usuario.rol)
        : false;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(initialForm);
    const [telefonoError, setTelefonoError] = useState<string | null>(null);
    const telefonoRef = useRef<HTMLInputElement>(null);
    const cursorTelefono = useRef<number | null>(null);

    // Tras reformatear, React deja el cursor al final: se reubica donde corresponde.
    useLayoutEffect(() => {
        const input = telefonoRef.current;
        if (cursorTelefono.current === null || !input) return;
        input.setSelectionRange(cursorTelefono.current, cursorTelefono.current);
        cursorTelefono.current = null;
    }, [form]);

    const actualizarTelefono = (texto: string, cursor: number) => {
        const telefono = formatearTelefonoInput(texto);
        cursorTelefono.current = posicionCursor(
            texto.slice(0, cursor),
            telefono,
        );
        setForm((actual) => ({ ...actual, telefono }));
    };

    const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, selectionStart } = e.target;
        actualizarTelefono(value, selectionStart ?? value.length);
    };

    // Borrar el guion (o el espacio de "+503 ") borra también el dígito contiguo.
    const handleTelefonoKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        const {
            value,
            selectionStart: inicio,
            selectionEnd: fin,
        } = e.currentTarget;
        if (inicio === null || inicio !== fin) return;

        if (e.key === 'Backspace' && esSeparador(value[inicio - 1])) {
            let i = inicio - 2;
            while (i >= 0 && !esDigito(value[i])) i--;
            if (i < 0) return;
            e.preventDefault();
            actualizarTelefono(value.slice(0, i) + value.slice(inicio), i);
        } else if (e.key === 'Delete' && esSeparador(value[inicio])) {
            let i = inicio + 1;
            while (i < value.length && !esDigito(value[i])) i++;
            if (i >= value.length) return;
            e.preventDefault();
            actualizarTelefono(
                value.slice(0, inicio) + value.slice(i + 1),
                inicio,
            );
        }
    };

    const invalidar = () =>
        queryClient.invalidateQueries({ queryKey: ['clientes'] });

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
        setTelefonoError(null);
    };

    const createMutation = useMutation({
        mutationFn: createCliente,
        onSuccess: () => {
            invalidar();
            cerrarModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Cliente> }) =>
            updateCliente(id, data),
        onSuccess: () => {
            invalidar();
            cerrarModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCliente,
        onSuccess: invalidar,
    });

    const abrirNuevo = () => {
        setEditingId(null);
        setForm(initialForm);
        setTelefonoError(null);
        setIsModalOpen(true);
    };

    const abrirEdicion = (cliente: Cliente) => {
        setEditingId(cliente.id);
        setForm({
            nombre: cliente.nombre,
            telefono: telefonoParaEditar(cliente.telefono),
            email: cliente.email ?? '',
            direccion: cliente.direccion ?? '',
            aceptaRecordatorios: cliente.aceptaRecordatorios ?? false,
        });
        setTelefonoError(null);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!normalizarTelefono(form.telefono)) {
            setTelefonoError(
                'Teléfono inválido. Usa 8 dígitos, por ejemplo 7001-0001',
            );
            return;
        }
        setTelefonoError(null);
        if (editingId) {
            updateMutation.mutate({ id: editingId, data: form });
        } else {
            createMutation.mutate(form);
        }
    };

    return {
        clientes,
        isLoading,
        puedeCrear,
        isModalOpen,
        editingId,
        form,
        setForm,
        telefonoError,
        telefonoRef,
        handleTelefonoChange,
        handleTelefonoKeyDown,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        deleteMutation,
        handleSubmit,
        isSaving: createMutation.isPending || updateMutation.isPending,
    };
}
