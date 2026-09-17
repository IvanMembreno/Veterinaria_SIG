import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../config/prisma.service.js';
import { ListFacturasQueryDto } from './dto/list-facturas-query.dto.js';
import { PagarFacturaDto } from './dto/pagar-factura.dto.js';

@Injectable()
export class FacturasService {
    constructor(private readonly prisma: PrismaService) {}

    findAll(query: ListFacturasQueryDto) {
        const where: Prisma.FacturaWhereInput = {
            ...(query.estado && { estado: query.estado }),
            ...((query.desde || query.hasta) && {
                fecha: {
                    ...(query.desde && { gte: new Date(query.desde) }),
                    ...(query.hasta && { lte: new Date(query.hasta) }),
                },
            }),
            ...(query.clienteId && {
                consulta: {
                    cita: { mascota: { clienteId: query.clienteId } },
                },
            }),
        };

        return this.prisma.factura.findMany({
            where,
            include: {
                detalles: { include: { servicio: true, insumo: true } },
            },
            orderBy: { fecha: 'desc' },
        });
    }

    async findOne(id: string) {
        const factura = await this.prisma.factura.findUnique({
            where: { id },
            include: {
                detalles: { include: { servicio: true, insumo: true } },
                consulta: true,
            },
        });
        if (!factura) throw new NotFoundException('Factura no encontrada');
        return factura;
    }

    async pagar(id: string, dto: PagarFacturaDto) {
        await this.findOne(id);
        return this.prisma.factura.update({
            where: { id },
            data: { estado: 'PAGADA', metodoPago: dto.metodoPago },
        });
    }
}
