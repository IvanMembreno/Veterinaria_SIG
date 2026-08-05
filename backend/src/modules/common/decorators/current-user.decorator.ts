import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Usuario } from '../../../generated/prisma/client.js';

export const CurrentUser = createParamDecorator(
    (
        _: unknown,
        ctx: ExecutionContext,
    ): Omit<Usuario, 'password'> | undefined => {
        const req = ctx.switchToHttp().getRequest<Request>();

        const user = req.user as Omit<Usuario, 'password'> | undefined;

        if (!user) return undefined;

        return user;
    },
);
