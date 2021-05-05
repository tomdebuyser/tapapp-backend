import { Injectable } from '@nestjs/common';

import { Environment } from '@libs/common';

@Injectable()
export class PayconiqConfig {
    constructor(
        readonly environment: Environment,
        readonly baseUrl: string,
        readonly apiKey: string,
        readonly apiUrl: string,
    ) {}
}
