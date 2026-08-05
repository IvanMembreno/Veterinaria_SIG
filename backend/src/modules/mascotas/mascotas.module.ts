import { Module } from '@nestjs/common';
import { MascotasController } from './mascotas.controller.js';
import { MascotasService } from './mascotas.service.js';

@Module({
    controllers: [MascotasController],
    providers: [MascotasService],
    exports: [MascotasService],
})
export class MascotasModule {}
