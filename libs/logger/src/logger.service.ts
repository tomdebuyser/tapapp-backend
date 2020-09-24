import { Injectable, Inject } from '@nestjs/common';
import { Namespace } from 'cls-hooked';
import * as pino from 'pino';

import { LoggerConfig } from './logger.config';
import { Environment } from '@libs/common';
import { namespaceToken, traceIdKey } from './logger.constants';

type LogMeta = Record<string, unknown> & {
    /**
     * Added as a label to the message, easy to search by.
     */
    context: string;
    /**
     * Id for the request or operation this log belongs to.
     * If none is passed, it will default to the idea found in the active namespace (if one is active).
     */
    traceId?: string;
    /**
     * Internally used by pino as the main message key in the JSON log - don't use it as it will be ignored.
     */
    message?: never;
    /**
     * Internally used by pino to log the current timestamp, overwriting may cause date formatting exceptions.
     */
    time?: never;
};

/**
 * Redacting these because they are in modern times (cloud native / container based) mostly redundant information.
 */
const basePropsToRedact = ['pid', 'hostname'];

/**
 * Common knowns tokens / secrets, add anything that is sensitive to this list.
 * NOTE: In local environments these will not be redacted.
 */
const secretsToRedact = [
    '*.password',
    '*.newPassword',
    '*.oldPassword',
    '*.accessToken',
    '*.refreshToken',
];

@Injectable()
export class LoggerService {
    private logger: pino.Logger;
    private formattedEnvironment: string;

    constructor(
        @Inject(namespaceToken) private readonly namespace: Namespace,
        private readonly config: LoggerConfig,
    ) {
        this.formattedEnvironment = this.config.environment.toUpperCase();

        const isLocalEnvironment = [
            Environment.Local,
            Environment.Test,
        ].includes(this.config.environment);

        this.logger = pino({
            redact: {
                remove: true,
                paths: isLocalEnvironment
                    ? basePropsToRedact
                    : [...basePropsToRedact, ...secretsToRedact],
            },
            prettyPrint: isLocalEnvironment
                ? ({
                      translateTime: 'yyyy-mm-dd HH:MM:ss',
                      messageFormat: '[{context}]: {message}',
                      ignore: 'pid,hostname',
                      // Doing this so DB queries are more readably printed in console
                      customPrettifiers: {
                          query: (value: unknown): string =>
                              typeof value === 'string'
                                  ? value
                                  : JSON.stringify(value),
                      },
                  } as pino.PrettyOptions)
                : false,
            level: this.config.logLevel,
            messageKey: 'message',
            mixin: this.metaMixin.bind(this),
        });
    }

    /**
     * Highest level of logging, use this in case something absolutely critical happens that
     * basically means the entire platform / application **can not function and can not automatically recover**.
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    fatal(message: string, meta: LogMeta): void {
        this.logger.fatal(meta, message);
    }

    /**
     * Use this level to log serious errors that are unexpected.
     *
     * For example:
     * Connection lost to a database or a redis instance.
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    error(message: string, meta: LogMeta): void {
        this.logger.error(meta, message);
    }

    /**
     * Use this level to log errors / unexpected behaviour that **we can handle**.
     *
     * For example:
     * - Most business exceptions (for example user not found, or user doesnt have access to operation / resource).
     * - External API is not responding.
     * - Database query errors / slow queries.
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    warn(message: string, meta: LogMeta): void {
        this.logger.warn(meta, message);
    }

    /**
     * Use this level to log general information that is always relevant.
     * These logs most likely will be visible on any environment, including production.
     *
     * For example:
     * - General application startup information
     * - HTTP request logging
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    info(message: string, meta: LogMeta): void {
        this.logger.info(meta, message);
    }

    /**
     * Use this level of logging for information useful during development.
     * Typically these logs will be visible on local, testing or remote development environments.
     *
     * For example:
     * - Logs that expose useful information to follow the flows of business logic during development, and to serve as an aid to pinpoint where the application breaks.
     * - Database query logs (succesful queries).
     *
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    debug(message: string, meta: LogMeta): void {
        this.logger.debug(meta, message);
    }

    /**
     * Lowest level of logging, only for absolute details. In most cases, prefer `debug`.
     * @param message Message for this log
     * @param meta Extra useful information for this log
     */
    trace(message: string, meta: LogMeta): void {
        this.logger.trace(meta, message);
    }

    metaMixin(): object {
        return {
            environment: this.formattedEnvironment,
            traceId: this.namespace.get(traceIdKey),
        };
    }
}
