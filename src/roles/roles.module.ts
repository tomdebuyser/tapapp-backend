import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database';
import { RolesController } from './roles.controller';
import { RolesQueries } from './roles.queries';

@Module({
    imports: [DatabaseModule],
    controllers: [RolesController],
    providers: [RolesQueries],
})
export class RolesModule {}
