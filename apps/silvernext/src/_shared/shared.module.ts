import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { LoggerModule } from '@libs/logger';
import { DatabaseModule } from '@libs/database';
import { Config } from '../config';

@Module({
    imports: [
        LoggerModule.register(Config.logging),
        DatabaseModule.register(Config.database),
        PassportModule.register({ defaultStrategy: 'local' }),
    ],
    exports: [LoggerModule, DatabaseModule, PassportModule],
})
export class SharedModule {}
