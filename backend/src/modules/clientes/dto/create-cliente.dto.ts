import {
    IsBoolean,
    IsDateString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { normalizarTelefono } from '../../common/utils/telefono.js';

const TELEFONO_INVALIDO =
    'Teléfono inválido. Usa 8 dígitos, por ejemplo 7001-0001';

// Un teléfono inválido se convierte en '' para que falle @Matches también en
// UpdateClienteDto (@IsOptional dejaría pasar null).
const normalizarTelefonoDto = ({ value }: { value: unknown }) =>
    typeof value === 'string' ? (normalizarTelefono(value) ?? '') : value;

export class CreateClienteDto {
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @Transform(normalizarTelefonoDto)
    @Matches(/^\d{8,15}$/, { message: TELEFONO_INVALIDO })
    telefono!: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    direccion?: string;

    @IsBoolean()
    @IsOptional()
    aceptaRecordatorios?: boolean;

    @IsDateString()
    @IsOptional()
    consentimientoFecha?: string;
}
