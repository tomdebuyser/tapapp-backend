import { DynamicModule } from '@nestjs/common';

import { UploaderConfig } from './uploader.config';
import { UploaderService } from './uploader.service';

export class UploaderModule {
    static register(config: UploaderConfig): DynamicModule {
        return {
            module: UploaderModule,
            providers: [
                {
                    provide: UploaderConfig,
                    useValue: config,
                },
                UploaderService,
            ],
            exports: [UploaderService],
        };
    }
}
