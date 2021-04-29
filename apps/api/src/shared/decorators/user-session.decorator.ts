import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUserSession = createParamDecorator(
    (_, context: ExecutionContext) => context.switchToHttp().getRequest().user,
);
