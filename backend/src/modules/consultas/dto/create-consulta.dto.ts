import { Type } from 'class-transformer';
import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';

class InsumoUsadoDto {
    @IsString()
    @IsNotEmpty()
    insumoId!: string;

    @IsInt()
    @Min(1)
    cantidad!: number;
}

class ServicioFacturadoDto {
    @IsString()
    @IsNotEmpty()
    servicioId!: string;

    @IsInt()
    @Min(1)
    @IsOptional()
    cantidad?: number;
}

export class CreateConsultaDto {
    @IsString()
    @IsNotEmpty()
    citaId!: string;

    @IsString()
    @IsOptional()
    diagnostico?: string;

    @IsString()
    @IsOptional()
    tratamiento?: string;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsNumber()
    @IsOptional()
    peso?: number;

    @IsNumber()
    @IsOptional()
    temperatura?: number;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => InsumoUsadoDto)
    insumos?: InsumoUsadoDto[];

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ServicioFacturadoDto)
    servicios!: ServicioFacturadoDto[];
}
