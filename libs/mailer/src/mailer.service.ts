import { Injectable } from '@nestjs/common';
import { Mandrill } from 'mandrill-api';
import { readFile, readFileSync } from 'fs';

import { LoggerService } from '@libs/logger';
import { MandrillMessage, MailTemplate } from './mailer.types';
import { MailerConfig } from './mailer.config';
import { User } from '@libs/database';
import {
    createRegisterMessage,
    createRequestPasswordResetMessage,
} from './messages';
import { ParseHtmlTemplateFailed } from './mailer.errors';

const context = 'Mailer';

@Injectable()
export class MailerService {
    constructor(
        private readonly config: MailerConfig,
        private readonly logger: LoggerService,
        private readonly mandrill: Mandrill,
    ) {}

    private readHtmlTemplate(file: MailTemplate): Promise<string> {
        const path = `${__dirname}/templates/compiled/${file}.template.html`;
        return new Promise((resolve, reject) => {
            readFile(path, (error, data) => {
                if (error) reject(error);
                else resolve(data.toString());
            });
        });
    }

    private async fillHtmlTemplate(message: MandrillMessage): Promise<string> {
        const { html } = message;

        // Read the file
        let result: string = null;
        try {
            result = await this.readHtmlTemplate(html.file);
        } catch (error) {
            this.logger.warn('Failed to read html template file', {
                context,
                error,
                html,
            });
            throw new ParseHtmlTemplateFailed();
        }

        // Add plain text version
        result = result.replace(/{{plainTextVersion}}/gi, message.text);

        // Substitute the variables
        Object.keys(html.variables || []).forEach(key => {
            result = result.replace(
                new RegExp(`{{${key}}}`, 'gi'),
                html.variables[key],
            );
        });

        return result;
    }

    private async sendMail(message: MandrillMessage): Promise<void> {
        const html = await this.fillHtmlTemplate(message);
        await new Promise((resolve, reject) => {
            this.mandrill.messages.send(
                {
                    message: {
                        ...message,
                        // eslint-disable-next-line @typescript-eslint/camelcase
                        from_email: this.config.mailFrom,
                        html,
                    },
                },
                result => {
                    this.logger.debug('Mail has been sent', {
                        context,
                        result,
                        content: message,
                    });
                    resolve();
                },
                error => {
                    this.logger.warn('Failed to send mail', { context, error });
                    reject(error);
                },
            );
        });
    }

    async sendRegisterMail(
        user: User,
        sender: string,
        resetToken: string,
    ): Promise<void> {
        await this.sendMail(
            createRegisterMessage(
                user,
                sender,
                resetToken,
                this.config.brandName,
                this.config.frontendUrl,
            ),
        );
    }

    async sendRequestPasswordResetMail(
        user: User,
        resetToken: string,
    ): Promise<void> {
        await this.sendMail(
            createRequestPasswordResetMessage(
                user,
                resetToken,
                this.config.brandName,
                this.config.frontendUrl,
            ),
        );
    }
}
