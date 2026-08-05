import {
    IsEmail,
    IsEnum,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';
import { Role } from '../../../generated/prisma/enums.js';

export class UpdateUsuarioDto {
    @IsString()
    @IsOptional()
    nombre?: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string;

    @IsEnum(Role)
    @IsOptional()
    rol?: Role;
}
