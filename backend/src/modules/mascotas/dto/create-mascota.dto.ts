import {
    IsDateString,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { Sexo } from '../../../generated/prisma/enums.js';

export class CreateMascotaDto {
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsString()
    @IsNotEmpty()
    especie!: string;

    @IsString()
    @IsOptional()
    raza?: string;

    @IsEnum(Sexo)
    sexo!: Sexo;

    @IsDateString()
    @IsOptional()
    fechaNac?: string;

    @IsNumber()
    @IsOptional()
    peso?: number;

    @IsString()
    @IsNotEmpty()
    clienteId!: string;
}
