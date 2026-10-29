import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getMascotas,
    createMascota,
    updateMascota,
    deleteMascota,
    type Mascota,
} from '../../../api/mascotas.api';
import { getClientes } from '../../../api/clientes.api';
import { useAuthStore } from '../../auth/useAuthStore';
import { ESPECIE_OTRA, opcionDeEspecie } from '../especies';

const initialForm = {
    nombre: '',
    especie: '',
    raza: '',
    sexo: 'MACHO',
    fechaNac: '',
    peso: '',
    clienteId: '',
};

export function useMascotas() {
    const queryClient = useQueryClient();
    const { data: mascotas, isLoading } = useQuery({
        queryKey: ['mascotas'],
        queryFn: getMascotas,
    });
    const { data: clientes } = useQuery({
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
    // Opción elegida en el select de especie. Va aparte de `form` porque todo `form` se envía
    // al backend; `form.especie` siempre guarda el texto final.
    const [especieSeleccion, setEspecieSeleccion] = useState('');
    // Último texto escrito en "Otro", para recuperarlo si se cambia de opción y se vuelve.
    const [especieOtraTexto, setEspecieOtraTexto] = useState('');
    const [imagen, setImagen] = useState<File | null>(null);

    const invalidar = (id: string | null) => {
        queryClient.invalidateQueries({ queryKey: ['mascotas'] });
        if (id) queryClient.invalidateQueries({ queryKey: ['mascota', id] });
    };

    const cerrarModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setForm(initialForm);
        setEspecieSeleccion('');
        setEspecieOtraTexto('');
        setImagen(null);
    };

    const createMutation = useMutation({
        mutationFn: createMascota,
        onSuccess: () => {
            invalidar(null);
            cerrarModal();
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: FormData }) =>
            updateMascota(id, data),
        onSuccess: (_result, variables) => {
            invalidar(variables.id);
            cerrarModal();
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMascota,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ['mascotas'] }),
    });

    const abrirNuevo = () => {
        setEditingId(null);
        setForm(initialForm);
        setEspecieSeleccion('');
        setEspecieOtraTexto('');
        setImagen(null);
        setIsModalOpen(true);
    };

    const abrirEdicion = (mascota: Mascota) => {
        setEditingId(mascota.id);
        setForm({
            nombre: mascota.nombre,
            especie: mascota.especie,
            raza: mascota.raza ?? '',
            sexo: mascota.sexo,
            fechaNac: mascota.fechaNac ? mascota.fechaNac.slice(0, 10) : '',
            peso: mascota.peso != null ? String(mascota.peso) : '',
            clienteId: mascota.clienteId,
        });
        // Si la especie guardada no está en la lista, queda en "Otro" con el texto tal cual.
        const opcion = opcionDeEspecie(mascota.especie);
        setEspecieSeleccion(opcion);
        setEspecieOtraTexto(opcion === ESPECIE_OTRA ? mascota.especie : '');
        setImagen(null);
        setIsModalOpen(true);
    };

    const elegirEspecie = (opcion: string) => {
        if (especieSeleccion === ESPECIE_OTRA) setEspecieOtraTexto(form.especie);
        setEspecieSeleccion(opcion);
        // Con "Otro" se envía lo escrito en el campo de texto; con el resto, el nombre de la lista.
        setForm({
            ...form,
            especie: opcion === ESPECIE_OTRA ? especieOtraTexto : opcion,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (value) data.append(key, value);
        });
        if (imagen) data.append('imagen', imagen);

        if (editingId) {
            updateMutation.mutate({ id: editingId, data });
        } else {
            createMutation.mutate(data);
        }
    };

    return {
        mascotas,
        clientes,
        isLoading,
        puedeCrear,
        isModalOpen,
        editingId,
        form,
        setForm,
        especieSeleccion,
        elegirEspecie,
        imagen,
        setImagen,
        abrirNuevo,
        abrirEdicion,
        cerrarModal,
        deleteMutation,
        handleSubmit,
        isSaving: createMutation.isPending || updateMutation.isPending,
    };
}
