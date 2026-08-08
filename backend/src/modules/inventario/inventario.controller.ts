import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('inventario')
export class InventarioController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    findAll() {
        return this.prisma.inventario.findMany();
    }
}
