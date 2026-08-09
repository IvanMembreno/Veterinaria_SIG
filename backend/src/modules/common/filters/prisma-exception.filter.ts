import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Prisma } from '../../../generated/prisma/client.js';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
    catch(
        exception: Prisma.PrismaClientKnownRequestError,
        host: ArgumentsHost,
    ) {
        const res = host.switchToHttp().getResponse<Response>();
        switch (exception.code) {
            case 'P2002':
                return res.status(HttpStatus.CONFLICT).json({
                    message: 'Ya existe un registro con ese valor único',
                });
            case 'P2003':
                return res.status(HttpStatus.CONFLICT).json({
                    message:
                        'No se puede eliminar: tiene registros relacionados',
                });
            case 'P2025':
                return res
                    .status(HttpStatus.NOT_FOUND)
                    .json({ message: 'Registro no encontrado' });
            default:
                return res
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .json({ message: 'Error interno del servidor' });
        }
    }
}
