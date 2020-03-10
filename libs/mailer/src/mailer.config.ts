import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerConfig {
    constructor(
        readonly environment: string,
        readonly mandrillApiKey: string,
        readonly mailFrom: string,
    ) {}
}
