import { Module } from '@nestjs/common';

import { DatabaseModule } from '@libs/database';
import { Config } from '../config';

@Module({
    imports: [DatabaseModule.register(Config.database)],
    exports: [DatabaseModule],
})
export class SharedModule {}
