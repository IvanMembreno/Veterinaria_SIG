import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from 'class-validator';

export class CreateInsumoDto {
    @IsString()
    @IsNotEmpty()
    nombre!: string;

    @IsString()
    @IsOptional()
    lote?: string;

    @IsDateString()
    @IsOptional()
    fechaVenc?: string;

    @IsNumber()
    stock!: number;

    @IsNumber()
    @IsOptional()
    stockMinimo?: number;

    @IsNumber()
    precioUnit!: number;
}
