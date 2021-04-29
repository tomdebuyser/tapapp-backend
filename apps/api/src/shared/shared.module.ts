import { Module } from '@nestjs/common';

import { ModelsModule } from '@libs/models';
import { Config } from '../config';

@Module({
    imports: [ModelsModule.register(Config.models)],
    exports: [ModelsModule],
})
export class SharedModule {}
