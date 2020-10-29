import { Injectable } from '@nestjs/common';

import { Environment } from '@libs/common';
import { LogLevel } from './logger.types';

@Injectable()
export class LoggerConfig {
    constructor(
        readonly environment: Environment,
        readonly logLevel: LogLevel,
        /**
         * Separate LogLevel for database logs. Database debug logs take up a lot of space in the overall logs
         * and tend to drown application logs, so this property is to be able to configure them separately.
         *
         * This log level can only be higher or equal to the main logLevel property, otherwise it will have no affect - as the main logLevel is always respected.
         */
        readonly databaseLogLevel: LogLevel,
        /**
         * Enable middleware that will add trace id's to all incoming requests, and subsequent logs within the request cycle.
         * In most cases this enabled is the desired behaviour, however, for hosted / background services, this could be disabled
         */
        readonly enableTraceId: boolean,
    ) {}
}
