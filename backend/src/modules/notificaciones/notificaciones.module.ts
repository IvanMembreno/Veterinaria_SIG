import { Module } from '@nestjs/common';
import { NotificacionesController } from './notificaciones.controller.js';
import { NotificacionesService } from './notificaciones.service.js';
import { DashboardModule } from '../dashboard/dashboard.module.js';

@Module({
    imports: [DashboardModule],
    controllers: [NotificacionesController],
    providers: [NotificacionesService],
})
export class NotificacionesModule {}
