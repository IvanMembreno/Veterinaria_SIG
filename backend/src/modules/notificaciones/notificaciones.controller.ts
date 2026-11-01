import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Role } from '../../generated/prisma/enums.js';
import type { Usuario } from '../../generated/prisma/client.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.GERENTE, Role.VETERINARIO, Role.RECEPCION, Role.INVENTARIO)
@Controller('notificaciones')
export class NotificacionesController {
    constructor(
        private readonly notificacionesService: NotificacionesService,
    ) {}

    @Get()
    listar(@CurrentUser() usuario: Omit<Usuario, 'password'>) {
        return this.notificacionesService.listar(usuario);
    }
}
