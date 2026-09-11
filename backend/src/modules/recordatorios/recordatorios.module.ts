import { Module } from '@nestjs/common';
import { RecordatoriosController } from './recordatorios.controller.js';
import { RecordatoriosService } from './recordatorios.service.js';

@Module({
    controllers: [RecordatoriosController],
    providers: [RecordatoriosService],
    exports: [RecordatoriosService],
})
export class RecordatoriosModule {}
