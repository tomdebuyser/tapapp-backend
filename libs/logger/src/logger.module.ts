import { DynamicModule } from '@nestjs/common';

import { LoggerService } from './logger.service';
import { LoggerConfig } from './logger.config';

export class LoggerModule {
    static register(config: LoggerConfig): DynamicModule {
        return {
            module: LoggerModule,
            providers: [
                { provide: LoggerConfig, useValue: config },
                LoggerService,
            ],
            exports: [LoggerService],
        };
    }
}
