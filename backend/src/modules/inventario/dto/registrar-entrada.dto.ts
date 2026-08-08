import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class RegistrarEntradaDto {
    @IsNumber()
    @IsNotEmpty()
    cantidad!: number;

    @IsString()
    @IsOptional()
    nota?: string;
}
