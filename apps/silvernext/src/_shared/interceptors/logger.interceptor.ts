import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { clone } from 'ramda';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { LoggerService } from '@libs/logger';

type RequestBody = Record<string, unknown>;

const excludeFromRequestBody = (body: RequestBody): RequestBody => {
    const clonedBody = clone(body);
    const propsToExclude: string[] = [
        'password',
        'accessToken',
        'refreshToken',
    ];

    /**
     * For now we do not omit nested parameters, revise if necessary down the line.
     */
    propsToExclude.forEach(key => {
        delete clonedBody[key];
    });

    return clonedBody;
};

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(private logger: LoggerService) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler<unknown>,
    ): Observable<unknown> {
        const req = context.switchToHttp().getRequest();

        const formatLogMessage = `${req.method} ${req.originalUrl}`;

        this.logger.log(formatLogMessage, {
            params: req.params,
            query: req.query,
            context: 'Request',
            body: excludeFromRequestBody(req.body),
        });

        return next.handle().pipe(
            tap(() => {
                this.logger.log(formatLogMessage, {
                    context: 'Response',
                    body: excludeFromRequestBody(req.body),
                });
            }),
        );
    }
}
