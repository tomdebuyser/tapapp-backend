import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { LoggerModule, LoggerInterceptor } from '@libs/logger';
import { AuthenticationModule } from './authentication/authentication.module';
import { Config } from './config';

@Module({
    imports: [LoggerModule.register(Config.logging), AuthenticationModule],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: LoggerInterceptor,
        },
    ],
})
export class AppModule {}
