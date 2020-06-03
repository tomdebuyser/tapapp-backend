import * as faker from 'faker';

import { MailerConfig } from './mailer.config';
import { Environment } from '@libs/common';

export const mockMailerConfig: MailerConfig = {
    brandName: faker.company.companyName(),
    environment: Environment.Test,
    frontendUrl: faker.internet.url(),
    mailFrom: faker.internet.email(),
    mandrillApiKey: faker.random.uuid(),
};

export const mockMandrill = {
    messages: {
        send(): void {},
    },
};
