import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { PayconiqPaymentData } from '@libs/payconiq';
import { PayconiqUpdateHandler } from './commands';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
    constructor(
        private readonly payconiqUpdateHandler: PayconiqUpdateHandler,
    ) {}

    @HttpCode(HttpStatus.OK)
    @Post('payconiq')
    async contentfulEventSessionCreated(
        @Body() body: unknown,
        @Res() res: Response,
    ): Promise<void> {
        // Casting the body here because the typing is not 100% accurate, resulting in an empty body after parsing
        this.payconiqUpdateHandler.execute({
            data: body as PayconiqPaymentData,
        });
        res.sendStatus(200);
    }
}
