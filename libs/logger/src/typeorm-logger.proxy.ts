import { Injectable } from '@nestjs/common';
import { Logger, QueryRunner } from 'typeorm';

import { LoggerService } from './logger.service';
import { LoggerConfig } from './logger.config';
import { LogLevel } from './logger.types';
import { logLevelNumeric } from './logger.constants';

const context = 'TypeOrm';

/**
 * This allows us to proxy TypeORM logs to our own logger.
 * This proxy needs to exist because the type signature for our custom LoggerService does not
 * match the TypeORM Logger.
 *
 * This should be passed to TypeORM when the module is being configured.
 *
 * Example models.module.ts:
 * ```
 * return {
 *     module: ModelsModule,
 *     imports: [
 *         TypeOrmModule.forRootAsync({
 *             inject: [LoggerService, LoggerConfig],
 *             useFactory: async (logger: LoggerService, loggerConfig: LoggerConfig) => ({
 *                 ...config,
 *                 entities: [User],
 *                 logger: new TypeormLoggerProxy(logger, loggerConfig),
 *             }),
 *         }),
 *         TypeOrmModule.forFeature([UserRepository]),
 *     ],
 *     providers: [TypeormLoggerProxy],
 *     exports: [TypeOrmModule],
 * };
 * ```
 *
 * Due to the fact database debug logs tend to drown out application debug logs, this logger can be configured with a separate log level.
 * However the main log level will ALWAYS be respected - this basically means that it always has to be equal or higher than the main log level.
 */
@Injectable()
export class TypeormLoggerProxy implements Logger {
    /**
     * A map of the log level to a flag indicating whether or not the level is active.
     */
    private readonly levelAvailability: Record<LogLevel, boolean>;

    constructor(
        private readonly logger: LoggerService,
        private readonly config: LoggerConfig,
    ) {
        const activeNumericLogLevel =
            logLevelNumeric[this.config.databaseLogLevel];
        this.levelAvailability = {
            silent: activeNumericLogLevel <= logLevelNumeric.silent,
            trace: activeNumericLogLevel <= logLevelNumeric.trace,
            debug: activeNumericLogLevel <= logLevelNumeric.debug,
            info: activeNumericLogLevel <= logLevelNumeric.info,
            warn: activeNumericLogLevel <= logLevelNumeric.warn,
            error: activeNumericLogLevel <= logLevelNumeric.error,
            fatal: activeNumericLogLevel <= logLevelNumeric.fatal,
        };
    }

    logQuery(
        query: string,
        parameters?: unknown[],
        _queryRunner?: QueryRunner,
    ): void {
        if (this.levelAvailability.debug) {
            this.logger.debug('Query', { context, query, parameters });
        }
    }

    logQueryError(
        error: string,
        query: string,
        parameters?: unknown[],
        _queryRunner?: QueryRunner,
    ): void {
        if (this.levelAvailability.error) {
            this.logger.error('Failed Query', {
                context,
                query,
                parameters,
                error,
            });
        }
    }

    logQuerySlow(
        time: number,
        query: string,
        parameters?: unknown[],
        _queryRunner?: QueryRunner,
    ): void {
        if (this.levelAvailability.warn) {
            this.logger.warn('Slow Query', {
                context,
                query,
                parameters,
                duration: time,
            });
        }
    }

    logSchemaBuild(message: string, _queryRunner?: QueryRunner): void {
        if (this.levelAvailability.info) {
            this.logger.info(message, { context });
        }
    }

    logMigration(message: string, _queryRunner?: QueryRunner): void {
        if (this.levelAvailability.info) {
            this.logger.info(message, { context });
        }
    }

    log(
        level: 'log' | 'info' | 'warn',
        message: string,
        _queryRunner?: QueryRunner,
    ): void {
        const standardisedLevel = level === 'log' ? 'info' : level;
        if (this.levelAvailability[standardisedLevel]) {
            this.logger[standardisedLevel](message, { context });
        }
    }
}
