import { DynamicModule, MiddlewareConsumer } from '@nestjs/common';
import { createNamespace } from 'cls-hooked';

import { LoggerService } from './logger.service';
import { LoggerConfig } from './logger.config';
import { namespaceToken } from './logger.constants';
import { TraceMiddleware } from './trace.middleware';

let registered = false;

export class LoggerModule {
    /**
     * Registers a logger module that is available *GLOBALLY*.
     * Only register this ONCE per running application.
     */
    static register(config: LoggerConfig): DynamicModule {
        if (registered) {
            throw new Error(
                'LoggerModule can not be registered more than once',
            );
        }
        registered = true;

        return {
            global: true,
            module: LoggerModule,
            providers: [
                { provide: LoggerConfig, useValue: config },
                {
                    provide: namespaceToken,
                    useValue: createNamespace('Logger'),
                },
                LoggerService,
            ],
            exports: [LoggerService, namespaceToken, LoggerConfig],
        };
    }

    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(TraceMiddleware).forRoutes('*');
    }
}
