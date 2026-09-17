import { Module } from '@nestjs/common';
import { FacturasController } from './facturas.controller.js';
import { FacturasService } from './facturas.service.js';

@Module({
    controllers: [FacturasController],
    providers: [FacturasService],
    exports: [FacturasService],
})
export class FacturasModule {}
