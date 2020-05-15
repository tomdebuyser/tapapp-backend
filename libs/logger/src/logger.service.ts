import { Injectable, LogLevel } from '@nestjs/common';
import * as winston from 'winston';
import { format as logFormat } from 'logform';
import * as chalk from 'chalk';
import { format } from 'date-fns';
import { isEmpty, flatten, is } from 'ramda';

import { LoggerConfig } from './logger.config';

const colours = {
    info: chalk.cyan,
    error: chalk.red,
    warn: chalk.keyword('orange'),
    debug: chalk.greenBright,
    verbose: chalk.magenta,
    key: chalk.greenBright,
    value: chalk.yellowBright,
    context: chalk.yellow,
};

interface ILogMeta extends Record<string, unknown> {
    /**
     * Added as a label to the message, easy to search by.
     */
    context: string;
    /**
     * IMPORTANT: Don't use message key as it is used internally by logForm / winston.
     * Using it will produce strange log output.
     */
    message?: never;
}

/**
 * This is the format our combined logform formats generate.
 */
interface IFormatMessageArgs {
    level: LogLevel;
    message: string;
    metadata: {
        context: string;
        timestamp: string;
        label: string;
    } & Record<string, unknown>;
}

function flattenParameters(params: object, parentKey?: string): unknown[] {
    return flatten(
        Object.entries(params)
            .map(([key, value]) => {
                if (is(Object, value)) {
                    return flattenParameters(value, key);
                }

                return parentKey
                    ? `${colours.key(parentKey)}.${colours.key(
                          key,
                      )}=${colours.value(value)}`
                    : `${colours.key(key)}=${colours.value(value)}`;
            })
            .filter(value => !isEmpty(value)),
    );
}

function formatMessage(data: IFormatMessageArgs): string {
    const { timestamp, label, context, ...parameters } = data.metadata;
    const themed = colours[data.level];

    const formattedContext = colours.context(context);
    const formattedLabel = themed(label.toUpperCase());
    const formattedLevel = themed(data.level.toUpperCase());
    const formattedMessage = themed(data.message);
    const formattedTimestamp = format(
        new Date(timestamp),
        'dd/MM/yyyy, HH:mm:s',
    );
    const flattenedParameters = flattenParameters(parameters);
    const formattedParameters = !isEmpty(flattenedParameters)
        ? `[${flattenedParameters.join(', ')}]`
        : '';

    return `[${formattedLabel}] - ${formattedTimestamp}  [${formattedLevel}] [${formattedContext}] "${formattedMessage}" ${formattedParameters}`;
}

@Injectable()
export class LoggerService {
    private logger: winston.Logger;

    constructor(private readonly config: LoggerConfig) {
        this.logger = winston.createLogger({
            level: this.config.logLevel,
            defaultMeta: {
                context: 'NO_CONTEXT',
            },
            format: logFormat.combine(
                logFormat.timestamp(),
                logFormat.label({
                    label: this.config.environment || 'NO_ENV_FOUND',
                }),
                logFormat.metadata(),
                logFormat.printf(formatMessage),
            ),
            transports: [new winston.transports.Console()],
        });
    }

    log(message: string, meta?: ILogMeta): void {
        this.logger.info(message, meta);
    }

    error(message: string, meta?: ILogMeta): void {
        this.logger.error(message, meta);
    }

    warn(message: string, meta?: ILogMeta): void {
        this.logger.warn(message, meta);
    }

    debug(message: string, meta?: ILogMeta): void {
        this.logger.debug(message, meta);
    }

    verbose(message: string, meta?: ILogMeta): void {
        this.logger.verbose(message, meta);
    }
}
