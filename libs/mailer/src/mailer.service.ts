import { Injectable } from '@nestjs/common';
import { Mandrill } from 'mandrill-api';

import { LoggerService } from '@libs/logger';
import { Environment } from '@libs/common';
import { MandrillMessage } from './types';
import { MailerConfig } from './mailer.config';

const context = 'Mailer';

@Injectable()
export class MailerService {
    private mandrillClient: Mandrill;

    constructor(
        private readonly config: MailerConfig,
        private readonly logger: LoggerService,
    ) {
        this.mandrillClient = new Mandrill(
            this.config.mandrillApiKey,
            this.config.environment !== Environment.Production,
        );
    }

    sendMail(message: MandrillMessage): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.mandrillClient.messages.send(
                {
                    message: {
                        ...message,
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        from_email: this.config.mailFrom,
                    },
                },
                result => {
                    this.logger.debug('Mail has been sent', {
                        context,
                        result,
                        content: message,
                    });
                    resolve(result);
                },
                error => {
                    this.logger.warn('Failed to send mail', { context, error });
                    reject(error);
                },
            );
        });
    }
}
