import { Injectable } from '@nestjs/common';

import { Environment } from '@libs/common';

@Injectable()
export class MailerConfig {
    constructor(
        readonly environment: Environment,
        readonly mandrillApiKey: string,
        readonly mailFrom: string,
        readonly brandName: string,
        readonly frontendUrl: string,
    ) {}
}
