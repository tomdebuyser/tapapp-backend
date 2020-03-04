import { Module } from '@nestjs/common';

import { MailerService } from './mailer.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [LoggerModule],
    providers: [MailerService],
    exports: [MailerService],
})
export class MailerModule {}
