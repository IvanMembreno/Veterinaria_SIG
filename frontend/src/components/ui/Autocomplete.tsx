import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './styles/autocomplete.module.css';

export interface AutocompleteOption {
    value: string;
    label: string;
    hint?: string;
}

interface AutocompleteProps {
    options: AutocompleteOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    emptyText?: string;
    id?: string;
    ariaLabel?: string;
    className?: string;
}

interface Posicion {
    left: number;
    width: number;
    top?: number;
    bottom?: number;
    maxHeight: number;
}

const ALTO_MAXIMO = 240;

// Minúsculas y sin acentos para comparar ("Pérez" coincide con "perez").
const normalizar = (texto: string) =>
    texto
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();

export function Autocomplete({
    options,
    value,
    onChange,
    placeholder,
    required = false,
    disabled = false,
    emptyText = 'Sin coincidencias',
    id,
    ariaLabel,
    className,
}: AutocompleteProps) {
    const idGenerado = useId();
    const inputId = id ?? idGenerado;
    const listboxId = `${inputId}-listbox`;
    const inputRef = useRef<HTMLInputElement>(null);

    const [abierto, setAbierto] = useState(false);
    const [activo, setActivo] = useState(0);
    const [posicion, setPosicion] = useState<Posicion | null>(null);
    // Mientras el usuario escribe se muestra su texto; si no, el label de la opción elegida.
    const [editando, setEditando] = useState(false);
    const [texto, setTexto] = useState('');
    const [valorPrevio, setValorPrevio] = useState(value);
    const [valorEmitido, setValorEmitido] = useState<string | null>(null);

    // Si `value` cambia desde fuera (formulario reiniciado o modo edición), se descarta lo escrito.
    if (value !== valorPrevio) {
        setValorPrevio(value);
        if (value !== valorEmitido) {
            setEditando(false);
            setTexto('');
        }
        setValorEmitido(null);
    }

    const seleccionada = options.find((o) => o.value === value);
    const textoMostrado = editando ? texto : (seleccionada?.label ?? '');

    const filtro = editando ? normalizar(texto) : '';
    const filtradas = filtro
        ? options.filter(
              (o) =>
                  normalizar(o.label).includes(filtro) ||
                  (o.hint ? normalizar(o.hint).includes(filtro) : false),
          )
        : options;

    const medir = () => {
        const rect = inputRef.current?.getBoundingClientRect();
        if (!rect) return;
        const abajo = window.innerHeight - rect.bottom - 8;
        const arriba = rect.top - 8;
        // Se abre hacia arriba solo si abajo no cabe y arriba hay más espacio.
        const haciaArriba = abajo < 160 && arriba > abajo;
        setPosicion({
            left: rect.left,
            width: rect.width,
            ...(haciaArriba
                ? { bottom: window.innerHeight - rect.top + 4 }
                : { top: rect.bottom + 4 }),
            maxHeight: Math.min(ALTO_MAXIMO, haciaArriba ? arriba : abajo),
        });
    };

    const abrir = () => {
        if (disabled) return;
        medir();
        setAbierto(true);
    };

    const cerrar = () => setAbierto(false);

    const elegir = (opcion: AutocompleteOption) => {
        setValorEmitido(opcion.value);
        onChange(opcion.value);
        setEditando(false);
        setTexto('');
        cerrar();
    };

    const escribir = (nuevoTexto: string) => {
        setTexto(nuevoTexto);
        setEditando(true);
        setActivo(0);
        if (value) {
            setValorEmitido('');
            onChange('');
        }
        abrir();
    };

    const alPerderFoco = () => {
        cerrar();
        if (!editando) return;
        // Si lo escrito coincide exactamente con una opción, se elige; si no, se limpia el texto.
        const exacta = options.find(
            (o) => normalizar(o.label) === normalizar(texto),
        );
        if (exacta) {
            elegir(exacta);
        } else {
            setEditando(false);
            setTexto('');
        }
    };

    const alPresionarTecla = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            if (!abierto) {
                abrir();
                return;
            }
            const total = filtradas.length;
            if (total === 0) return;
            setActivo((i) =>
                e.key === 'ArrowDown' ? (i + 1) % total : (i - 1 + total) % total,
            );
        } else if (e.key === 'Enter') {
            if (abierto && filtradas[activo]) {
                e.preventDefault();
                elegir(filtradas[activo]);
            }
        } else if (e.key === 'Escape' && abierto) {
            // Cierra solo la lista, no el Modal que la contiene.
            e.preventDefault();
            e.stopPropagation();
            cerrar();
        }
    };

    // Validación nativa del formulario: con `required` no se envía sin una opción elegida.
    useEffect(() => {
        inputRef.current?.setCustomValidity(
            required && !value ? 'Selecciona una opción de la lista.' : '',
        );
    }, [required, value]);

    // La lista es `position: fixed`; se recoloca al hacer scroll (también dentro del Modal) o al redimensionar.
    useEffect(() => {
        if (!abierto) return;
        window.addEventListener('scroll', medir, true);
        window.addEventListener('resize', medir);
        return () => {
            window.removeEventListener('scroll', medir, true);
            window.removeEventListener('resize', medir);
        };
    });

    useEffect(() => {
        if (!abierto) return;
        document
            .getElementById(`${inputId}-opt-${activo}`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [abierto, activo, inputId]);

    const indiceActivo = Math.min(activo, Math.max(filtradas.length - 1, 0));
    const mostrarLista = abierto && posicion !== null;

    return (
        <div className={`${styles.root} ${className ?? ''}`}>
            <input
                ref={inputRef}
                id={inputId}
                type="text"
                role="combobox"
                className={styles.input}
                value={textoMostrado}
                placeholder={placeholder}
                disabled={disabled}
                autoComplete="off"
                aria-label={ariaLabel}
                aria-required={required}
                aria-autocomplete="list"
                aria-expanded={mostrarLista}
                aria-controls={listboxId}
                aria-activedescendant={
                    mostrarLista && filtradas.length > 0
                        ? `${inputId}-opt-${indiceActivo}`
                        : undefined
                }
                onChange={(e) => escribir(e.target.value)}
                onFocus={abrir}
                onClick={abrir}
                onBlur={alPerderFoco}
                onKeyDown={alPresionarTecla}
            />

            {mostrarLista &&
                createPortal(
                    <ul
                        id={listboxId}
                        role="listbox"
                        className={styles.listbox}
                        style={{
                            left: posicion.left,
                            width: posicion.width,
                            top: posicion.top,
                            bottom: posicion.bottom,
                            maxHeight: posicion.maxHeight,
                        }}
                        // Evita que el input pierda el foco antes de registrar el clic.
                        onMouseDown={(e) => e.preventDefault()}
                    >
                        {filtradas.length === 0 ? (
                            <li className={styles.empty}>{emptyText}</li>
                        ) : (
                            filtradas.map((o, i) => (
                                <li
                                    key={o.value}
                                    id={`${inputId}-opt-${i}`}
                                    role="option"
                                    aria-selected={o.value === value}
                                    className={`${styles.option} ${
                                        i === indiceActivo
                                            ? styles.optionActive
                                            : ''
                                    } ${
                                        o.value === value
                                            ? styles.optionSelected
                                            : ''
                                    }`}
                                    onMouseEnter={() => setActivo(i)}
                                    onClick={() => elegir(o)}
                                >
                                    <span className={styles.optionLabel}>
                                        {o.label}
                                    </span>
                                    {o.hint && (
                                        <span className={styles.optionHint}>
                                            {o.hint}
                                        </span>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>,
                    document.body,
                )}
        </div>
    );
}
