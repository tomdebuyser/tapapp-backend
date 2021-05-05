import { Module } from '@nestjs/common';

import { PayconiqModule } from '@libs/payconiq';
import { Config } from '../config';
import { SharedModule } from '../shared/shared.module';
import { PayconiqUpdateHandler } from './commands';
import { WebhooksController } from './webhooks.controller';

@Module({
    imports: [SharedModule, PayconiqModule.register(Config.payconiq)],
    controllers: [WebhooksController],
    providers: [PayconiqUpdateHandler],
})
export class WebhooksModule {}
