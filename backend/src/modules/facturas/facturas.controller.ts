import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Query,
    UseGuards,
} from '@nestjs/common';
import { FacturasService } from './facturas.service.js';
import { ListFacturasQueryDto } from './dto/list-facturas-query.dto.js';
import { PagarFacturaDto } from './dto/pagar-factura.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Role } from '../../generated/prisma/enums.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.RECEPCION, Role.GERENTE)
@Controller('facturas')
export class FacturasController {
    constructor(private readonly facturasService: FacturasService) {}

    @Get()
    findAll(@Query() query: ListFacturasQueryDto) {
        return this.facturasService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.facturasService.findOne(id);
    }

    @Patch(':id/pagar')
    pagar(@Param('id') id: string, @Body() dto: PagarFacturaDto) {
        return this.facturasService.pagar(id, dto);
    }
}
