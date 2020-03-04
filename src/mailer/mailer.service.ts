import { Injectable } from '@nestjs/common';
import { Mandrill } from 'mandrill-api';

import { Config, Environment } from '../config';
import { MandrillMessage } from './messages';
import { LoggerService } from '../logger/logger.service';

const context = 'Mailer';

@Injectable()
export class MailerService {
    private mandrillClient: Mandrill;

    constructor(private readonly logger: LoggerService) {
        this.mandrillClient = new Mandrill(
            Config.mailing.mandrillApiKey,
            Config.environment !== Environment.Production,
        );
    }

    sendMail(message: MandrillMessage): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.mandrillClient.messages.send(
                {
                    message: {
                        ...message,
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        from_email: Config.mailing.mailFrom,
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
