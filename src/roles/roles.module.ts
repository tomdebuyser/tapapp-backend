import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesQueries } from './roles.queries';
import { LoggerModule } from '../logger/logger.module';

@Module({
    imports: [DatabaseModule, LoggerModule],
    controllers: [RolesController],
    providers: [RolesService, RolesQueries],
})
export class RolesModule {}
