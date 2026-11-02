import { Module } from '@nestjs/common';
import { CitasController } from './citas.controller.js';
import { CitasService } from './citas.service.js';
import { RecordatoriosModule } from '../recordatorios/recordatorios.module.js';

@Module({
    imports: [RecordatoriosModule],
    controllers: [CitasController],
    providers: [CitasService],
    exports: [CitasService],
})
export class CitasModule {}
