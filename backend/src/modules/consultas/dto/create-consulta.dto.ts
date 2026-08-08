import { Type } from 'class-transformer';
import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';

class InsumoUsadoDto {
    @IsString()
    @IsNotEmpty()
    insumoId!: string;

    @IsNumber()
    cantidad!: number;
}

class ServicioFacturadoDto {
    @IsString()
    @IsNotEmpty()
    servicioId!: string;

    @IsNumber()
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
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ServicioFacturadoDto)
    servicios!: ServicioFacturadoDto[];
}
