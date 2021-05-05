import { DynamicModule, HttpModule } from '@nestjs/common';

import { PayconiqConfig } from './payconiq.config';
import { PayconiqService } from './payconiq.service';

export class PayconiqModule {
    static register(config: PayconiqConfig): DynamicModule {
        return {
            module: PayconiqModule,
            imports: [HttpModule],
            providers: [
                {
                    provide: PayconiqConfig,
                    useValue: config,
                },
                PayconiqService,
            ],
            exports: [PayconiqService],
        };
    }
}
