import { Module } from '@nestjs/common';

import { PayconiqModule } from '@libs/payconiq';
import { Config } from '../config';
import { SharedModule } from '../shared/shared.module';
import {
    CancelPayconiqPaymentHandler,
    CreatePayconiqPaymentHandler,
    CreatePaymentHandler,
} from './commands';
import { PaymentsController } from './payments.controller';
import { GetPayconiqPaymentHandler } from './queries';

@Module({
    imports: [SharedModule, PayconiqModule.register(Config.payconiq)],
    controllers: [PaymentsController],
    providers: [
        CreatePaymentHandler,
        CreatePayconiqPaymentHandler,
        CancelPayconiqPaymentHandler,
        GetPayconiqPaymentHandler,
    ],
})
export class PaymentsModule {}
