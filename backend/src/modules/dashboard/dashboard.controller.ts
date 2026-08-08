import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GERENTE)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get('resumen')
    resumen() {
        return this.dashboardService.resumen();
    }

    @Get('ingresos-por-servicio')
    ingresos() {
        return this.dashboardService.ingresosPorServicio();
    }

    @Get('consultas-por-veterinario')
    porVeterinario() {
        return this.dashboardService.consultasPorVeterinario();
    }

    @Get('ticket-promedio')
    ticket() {
        return this.dashboardService.ticketPromedio();
    }

    @Get('ocupacion')
    ocupacion() {
        return this.dashboardService.tasaOcupacion();
    }

    @Get('stock-bajo')
    stockBajo() {
        return this.dashboardService.stockBajo();
    }
}
