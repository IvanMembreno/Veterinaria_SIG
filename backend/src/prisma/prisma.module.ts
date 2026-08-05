import { Module, Global } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service.js';

@Global()
@Module({
    controllers: [],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}
