import { Injectable, LogLevel } from '@nestjs/common';

@Injectable()
export class LoggerConfig {
    constructor(readonly environment: string, readonly logLevel: LogLevel) {}
}
