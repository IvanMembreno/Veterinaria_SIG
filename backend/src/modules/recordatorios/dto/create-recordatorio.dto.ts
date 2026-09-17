import { Type } from 'class-transformer';
import {
    IsDate,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
} from 'class-validator';
import { TipoRecordatorio } from '../../../generated/prisma/enums.js';

export class CreateRecordatorioDto {
    @IsString()
    @IsNotEmpty()
    mascotaId!: string;

    @IsEnum(TipoRecordatorio)
    tipo!: TipoRecordatorio;

    @IsDate()
    @Type(() => Date)
    fechaProgramada!: Date;

    @IsString()
    @IsOptional()
    nota?: string;
}
