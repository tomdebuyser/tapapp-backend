import { DynamicModule } from '@nestjs/common';

import { LoggerModule, LoggerConfig } from '@libs/logger';
import { MailerService } from './mailer.service';
import { MailerConfig } from './mailer.config';

export class MailerModule {
    static register(config: MailerConfig & LoggerConfig): DynamicModule {
        return {
            module: MailerModule,
            imports: [LoggerModule.register(config)],
            providers: [
                {
                    provide: MailerConfig,
                    useValue: config,
                },
                MailerService,
            ],
            exports: [MailerService],
        };
    }
}
