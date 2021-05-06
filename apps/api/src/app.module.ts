import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LoggerModule, LoggerInterceptor } from '@libs/logger';
import { AuthenticationModule } from './authentication/authentication.module';
import { Config } from './config';
import { CategoriesModule } from './categories/categories.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { WebhooksModule } from './webhooks/webhooks.module';

@Module({
    imports: [
        LoggerModule.register(Config.logging),
        AuthenticationModule,
        CategoriesModule,
        OrdersModule,
        PaymentsModule,
        WebhooksModule,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggerInterceptor,
        },
    ],
})
export class AppModule {}
