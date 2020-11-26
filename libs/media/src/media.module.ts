import { DynamicModule } from '@nestjs/common';

import { MediaConfig } from './media.config';
import { MediaService } from './media.service';

export class MediaModule {
    static register(config: MediaConfig): DynamicModule {
        return {
            module: MediaModule,
            providers: [
                {
                    provide: MediaConfig,
                    useValue: config,
                },
                MediaService,
            ],
            exports: [MediaService],
        };
    }
}
