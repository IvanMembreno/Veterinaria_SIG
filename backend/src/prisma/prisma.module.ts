import { Module, Global } from '@nestjs/common';
import { PrismaService } from '../config/prisma.service';

@Global()
@Module({
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
