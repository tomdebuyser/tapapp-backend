import { Request } from 'express';
import { createParamDecorator } from '@nestjs/common';

export const Origin = createParamDecorator((_, req: Request) =>
    req.get('origin'),
);
