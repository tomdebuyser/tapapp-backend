import { Injectable } from '@nestjs/common';

import { Environment } from '@libs/common';
import { LogLevel } from './logger.types';

@Injectable()
export class LoggerConfig {
    constructor(
        readonly environment: Environment,
        readonly logLevel: LogLevel,
        /**
         * Enable middleware that will add trace id's to all incoming requests, and subsequent logs within the request cycle.
         * In most cases this enabled is the desired behaviour, however, for hosted / background services, this could be disabled
         */
        readonly enableTraceId: boolean,
    ) {}
}
