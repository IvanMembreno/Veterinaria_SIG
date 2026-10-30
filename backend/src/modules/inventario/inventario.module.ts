import { Module } from '@nestjs/common';
import { InventarioController } from './inventario.controller.js';
import { InventarioService } from './inventario.service.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
    imports: [CloudinaryModule],
    controllers: [InventarioController],
    providers: [InventarioService],
})
export class InventarioModule {}
