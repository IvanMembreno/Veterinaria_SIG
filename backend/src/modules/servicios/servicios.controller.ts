import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('servicios')
export class ServiciosController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    findAll() {
        return this.prisma.servicio.findMany({ where: { activo: true } });
    }
}
