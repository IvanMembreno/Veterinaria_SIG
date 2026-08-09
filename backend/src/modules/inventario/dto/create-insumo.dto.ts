import {
    IsDateString,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
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
    @Min(0)
    stock!: number;

    @IsNumber()
    @Min(0)
    @IsOptional()
    stockMinimo?: number;

    @IsNumber()
    @Min(0)
    precioUnit!: number;
}
