import { Module } from '@nestjs/common';
import { RecordatoriosController } from './recordatorios.controller.js';
import { RecordatoriosService } from './recordatorios.service.js';
import { WhatsappService } from './whatsapp.service.js';

@Module({
    controllers: [RecordatoriosController],
    providers: [RecordatoriosService, WhatsappService],
    exports: [RecordatoriosService, WhatsappService],
})
export class RecordatoriosModule {}
