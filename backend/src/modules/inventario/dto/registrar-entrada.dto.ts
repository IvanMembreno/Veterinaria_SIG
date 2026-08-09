import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class RegistrarEntradaDto {
    @IsInt()
    @Min(1)
    cantidad!: number;

    @IsString()
    @IsOptional()
    nota?: string;
}
