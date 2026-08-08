import { Module } from '@nestjs/common';
import { ServiciosController } from './servicios.controller.js';

@Module({ controllers: [ServiciosController] })
export class ServiciosModule {}
