import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';
import { Sexo } from '../../../generated/prisma/enums.js';
import { Type } from 'class-transformer';

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

    @IsDate()
    @Type(() => Date)
    @IsOptional()
    fechaNac?: Date;

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    peso?: number;

    @IsString()
    @IsNotEmpty()
    clienteId!: string;
}
