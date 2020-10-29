import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request } from 'express';

import { LoggerService } from '@libs/logger';

const context = 'Request';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
    constructor(private readonly logger: LoggerService) {}

    intercept(
        executionContext: ExecutionContext,
        next: CallHandler<unknown>,
    ): Observable<unknown> {
        const req = executionContext.switchToHttp().getRequest<Request>();
        const formatLogMessage = `${req.method} ${req.originalUrl}`;
        const startTime = Date.now();
        return next.handle().pipe(
            tap(() => {
                this.logger.info(formatLogMessage, {
                    context,
                    status: executionContext.switchToHttp().getResponse()
                        .statusCode,
                    duration: `${this.calculateRequestDuration(startTime)}ms`,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                    host: req.hostname,
                });
            }),
            catchError(error => {
                this.logger.warn(formatLogMessage, {
                    context,
                    status:
                        error?.response?.statusCode ||
                        HttpStatus.INTERNAL_SERVER_ERROR,
                    code: error?.response?.error || 'Unknown error',
                    description: error?.response?.message || 'No description',
                    duration: `${this.calculateRequestDuration(startTime)}ms`,
                    params: req.params,
                    query: req.query,
                    body: req.body,
                    host: req.hostname,
                });

                return throwError(error);
            }),
        );
    }

    /**
     * Calculates the amount of time it took to handle a request.
     * @param startTime UNIX timestamp of when the request came in.
     */
    private calculateRequestDuration(startTime: number): number {
        return Date.now() - startTime;
    }
}
