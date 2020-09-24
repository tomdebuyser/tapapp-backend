import { Injectable } from '@nestjs/common';
import { Logger, QueryRunner } from 'typeorm';

import { LoggerService } from './logger.service';

const context = 'TypeOrm';

/**
 * This allows us to proxy TypeORM logs to our own logger.
 * This proxy needs to exist because the type signature for our custom LoggerService does not
 * match the TypeORM Logger.
 *
 * This should be passed to TypeORM when the module is being configured.
 *
 * Example database.module.ts:
 * ```
 * return {
 *     module: DatabaseModule,
 *     imports: [
 *         TypeOrmModule.forRootAsync({
 *             inject: [LoggerService],
 *             useFactory: async (logger: LoggerService) => ({
 *                 ...config,
 *                 entities: [Role, User],
 *                 logger: new TypeormLoggerProxy(logger),
 *             }),
 *         }),
 *         TypeOrmModule.forFeature([RoleRepository, UserRepository]),
 *     ],
 *     providers: [TypeormLoggerProxy],
 *     exports: [TypeOrmModule],
 * };
 * ```
 */
@Injectable()
export class TypeormLoggerProxy implements Logger {
    constructor(private readonly logger: LoggerService) {}

    logQuery(
        query: string,
        parameters?: unknown[],
        _queryRunner?: QueryRunner,
    ): void {
        this.logger.debug('Query', { context, query, parameters });
    }

    logQueryError(
        error: string,
        query: string,
        parameters?: unknown[],
        _queryRunner?: QueryRunner,
    ): void {
        this.logger.error('Failed Query', {
            context,
            query,
            parameters,
            error,
        });
    }

    logQuerySlow(
        time: number,
        query: string,
        parameters?: unknown[],
        _queryRunner?: QueryRunner,
    ): void {
        this.logger.warn('Slow Query', {
            context,
            query,
            parameters,
            duration: time,
        });
    }

    logSchemaBuild(message: string, _queryRunner?: QueryRunner): void {
        this.logger.info(message, { context });
    }

    logMigration(message: string, _queryRunner?: QueryRunner): void {
        this.logger.info(message, { context });
    }

    log(
        level: 'log' | 'info' | 'warn',
        message: string,
        _queryRunner?: QueryRunner,
    ): void {
        const method = level === 'log' ? 'info' : level;
        this.logger[method](message, { context });
    }
}
