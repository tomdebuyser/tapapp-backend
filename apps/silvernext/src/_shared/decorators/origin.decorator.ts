import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Origin = createParamDecorator((_, context: ExecutionContext) =>
    context
        .switchToHttp()
        .getRequest()
        .get('origin'),
);
