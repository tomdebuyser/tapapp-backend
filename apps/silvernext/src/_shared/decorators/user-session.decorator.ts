import { Request } from 'express';
import { createParamDecorator } from '@nestjs/common';

export const UserSession = createParamDecorator((_, req: Request) => req.user);
