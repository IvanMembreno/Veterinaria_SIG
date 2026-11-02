// Mantener sincronizado con backend/src/modules/common/utils/telefono.ts.

const CODIGO_SV = '503';

// Códigos de país de 1 y 2 dígitos (plan E.164); el resto usa 3 dígitos.
const CODIGOS_1 = ['1', '7'];
const CODIGOS_2 = (
    '20 27 30 31 32 33 34 36 39 40 41 43 44 45 46 47 48 49 51 52 53 54 55 56 ' +
    '57 58 60 61 62 63 64 65 66 81 82 84 86 90 91 92 93 94 95 98'
).split(' ');

/**
 * Normaliza un teléfono escrito por el usuario al formato internacional solo con
 * dígitos (p. ej. "7001-0001" -> "50370010001"). Devuelve null si es inválido.
 */
export function normalizarTelefono(
    valor: string | null | undefined,
): string | null {
    if (!valor) return null;
    const texto = valor.trim();
    const digitos = texto.replace(/\D/g, '');

    if (texto.startsWith('+')) {
        return digitos.length >= 8 && digitos.length <= 15 ? digitos : null;
    }
    if (digitos.length === 8) return CODIGO_SV + digitos;
    if (digitos.length === 11 && digitos.startsWith(CODIGO_SV)) return digitos;
    return null;
}

/**
 * Igual que normalizarTelefono, pero para valores ya guardados: un internacional
 * normalizado se guarda sin "+" (p. ej. "14155550123") y también se acepta.
 */
export function leerTelefonoGuardado(
    valor: string | null | undefined,
): string | null {
    if (!valor) return null;
    return normalizarTelefono(valor) ?? normalizarTelefono(`+${valor.trim()}`);
}

function separarCodigo(digitos: string): [string, string] {
    const largo = CODIGOS_1.includes(digitos.slice(0, 1))
        ? 1
        : CODIGOS_2.includes(digitos.slice(0, 2))
          ? 2
          : 3;
    return [digitos.slice(0, largo), digitos.slice(largo)];
}

/** "+503 7001-0001" para El Salvador y "+código número" para otros países. */
export function formatearTelefono(valor: string | null | undefined): string {
    const telefono = leerTelefonoGuardado(valor);
    if (!telefono) return valor?.trim() ?? '';

    if (telefono.length === 11 && telefono.startsWith(CODIGO_SV)) {
        const local = telefono.slice(3);
        return `+${CODIGO_SV} ${local.slice(0, 4)}-${local.slice(4)}`;
    }
    const [codigo, numero] = separarCodigo(telefono);
    return `+${codigo} ${numero}`;
}

/** Valor para precargar en un formulario: sin el prefijo 503 ("7001-0001"). */
export function telefonoParaEditar(valor: string | null | undefined): string {
    const telefono = leerTelefonoGuardado(valor);
    if (!telefono) return valor?.trim() ?? '';

    if (telefono.length === 11 && telefono.startsWith(CODIGO_SV)) {
        const local = telefono.slice(3);
        return `${local.slice(0, 4)}-${local.slice(4)}`;
    }
    return `+${telefono}`;
}

function formatearLocal(digitos: string): string {
    return digitos.length > 4
        ? `${digitos.slice(0, 4)}-${digitos.slice(4)}`
        : digitos;
}

/**
 * Formatea el teléfono mientras se escribe: "7766-5544", "+503 7766-5544" o
 * "+<dígitos>" para otros países. Limpia espacios, guiones y paréntesis al pegar.
 */
export function formatearTelefonoInput(valor: string): string {
    const texto = valor.trimStart();
    const digitos = texto.replace(/\D/g, '');
    // "503 7766-5544" pegado sin "+" se interpreta como número de El Salvador.
    const internacional =
        texto.startsWith('+') ||
        (digitos.length > 8 && digitos.startsWith(CODIGO_SV));

    if (!internacional) return formatearLocal(digitos.slice(0, 8));
    if (digitos.startsWith(CODIGO_SV)) {
        const local = digitos.slice(3, 11);
        return local
            ? `+${CODIGO_SV} ${formatearLocal(local)}`
            : `+${CODIGO_SV}`;
    }
    return `+${digitos.slice(0, 15)}`;
}
