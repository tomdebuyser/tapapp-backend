import { Module } from '@nestjs/common';

import { LoggerModule } from '@libs/logger';
import { DatabaseModule } from '@libs/database';
import { Config } from '../config';
import { PassportModule } from '@nestjs/passport';

@Module({
    imports: [
        LoggerModule.register(Config.logging),
        DatabaseModule.register(Config.database),
        PassportModule.register({ defaultStrategy: 'local' }),
    ],
    exports: [LoggerModule, DatabaseModule, PassportModule],
})
export class SharedModule {}
