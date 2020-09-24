import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

import { LoggerService } from './logger.service';

/**
 * This allows us to proxy NestJS logs to our own logger.
 * This proxy needs to exist because the type signature for our custom LoggerService does not
 * match the NestJS LoggerService.
 *
 * This should only be used when configuring NestJS.
 *
 * Example main.ts:
 * ```
 * const app = await NestFactory.create(AppModule, getAppOptions());
 * const logger = app.get(LoggerService);
 * app.useLogger(new NestLoggerProxy(logger));
 * ```
 */
@Injectable()
export class NestLoggerProxy implements NestLoggerService {
    constructor(private readonly logger: LoggerService) {}

    log(message: string, context?: string): void {
        this.logger.info(message, { context });
    }
    error(message: string, trace?: string, context?: string): void {
        this.logger.error(message, { context, error: trace });
    }
    warn(message: string, context?: string): void {
        this.logger.warn(message, { context });
    }
    debug?(message: string, context?: string): void {
        this.logger.debug(message, { context });
    }
    verbose?(message: string, context?: string): void {
        this.logger.trace(message, { context });
    }
}
