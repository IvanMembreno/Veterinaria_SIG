import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class CreateServicioDto {
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsNumber()
    @Type(() => Number)
    @Min(0)
    precio!: number;

    @IsBoolean()
    @IsOptional()
    activo?: boolean;
}
