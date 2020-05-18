import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserSession = createParamDecorator(
    (_, context: ExecutionContext) => context.switchToHttp().getRequest().user,
);
