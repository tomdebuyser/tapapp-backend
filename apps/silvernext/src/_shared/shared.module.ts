import { Module } from '@nestjs/common';

import { LoggerModule } from '@libs/logger';
import { DatabaseModule } from '@libs/database';
import { Config } from '../config';

@Module({
    imports: [
        LoggerModule.register(Config.logging),
        DatabaseModule.register(Config.database),
    ],
    exports: [LoggerModule, DatabaseModule],
})
export class SharedModule {}
