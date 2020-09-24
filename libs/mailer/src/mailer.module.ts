import { DynamicModule } from '@nestjs/common';
import { Mandrill } from 'mandrill-api';

import { MailerService } from './mailer.service';
import { MailerConfig } from './mailer.config';
import { Environment } from '@libs/common';

export class MailerModule {
    static register(config: MailerConfig): DynamicModule {
        return {
            module: MailerModule,
            providers: [
                {
                    provide: MailerConfig,
                    useValue: config,
                },
                {
                    provide: Mandrill,
                    useValue: new Mandrill(
                        config.mandrillApiKey,
                        config.environment !== Environment.Production,
                    ),
                },
                MailerService,
            ],
            exports: [MailerService],
        };
    }
}
