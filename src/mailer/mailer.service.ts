import { Injectable } from '@nestjs/common';
import { Mandrill } from 'mandrill-api';

import { Config } from '../config';
import { MandrillMessage } from './messages';

@Injectable()
export class MailerService {
    private mandrillClient: Mandrill;

    constructor() {
        this.mandrillClient = new Mandrill(
            Config.mandrillApiKey,
            Config.environment !== 'production',
        );
    }

    sendMail(message: MandrillMessage): Promise<unknown> {
        return new Promise((resolve, reject) => {
            this.mandrillClient.messages.send(
                { message: { ...message, from_email: 'silvernext@icapps.be' } }, // eslint-disable-line @typescript-eslint/camelcase
                function onSuccess(result) {
                    console.info('Mail has been sent!');
                    console.info(message.text);
                    resolve(result);
                },
                function onError(error) {
                    console.info(`Error while sending mail: ${error}`);
                    reject(error);
                },
            );
        });
    }
}
