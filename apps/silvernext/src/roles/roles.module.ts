import { Module } from '@nestjs/common';

import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesQueries } from './roles.queries';
import { SharedModule } from '../_shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [RolesController],
    providers: [RolesService, RolesQueries],
})
export class RolesModule {}
