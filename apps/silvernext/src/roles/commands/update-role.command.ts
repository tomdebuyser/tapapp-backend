import { Injectable } from '@nestjs/common';
import { mergeDeepLeft } from 'ramda';

import { LoggerService } from '@libs/logger';
import { RoleRepository } from '@libs/models';
import { UserSession } from '../../shared/constants';
import { UpdateRoleRequest } from '../dto';
import { RoleNameAlreadyInUse, RoleNotFound } from '../roles.errors';

const context = 'UpdateRoleHandler';

@Injectable()
export class UpdateRoleHandler {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute(
        body: UpdateRoleRequest,
        roleId: string,
        session: UserSession,
    ): Promise<string> {
        // The role should already exist
        const existingRole = await this.roleRepository.findOne({ id: roleId });
        if (!existingRole) {
            this.logger.warn('Failed to update: role with id not found', {
                context,
                roleId,
            });
            throw new RoleNotFound();
        }

        // There should not exist another role with the given name
        const { name, permissions } = body;
        const otherRole = await this.roleRepository.findOne({ name });
        if (otherRole && otherRole.id !== roleId) {
            this.logger.warn('Failed to update: role name already in use', {
                context,
                roleId,
                name,
            });
            throw new RoleNameAlreadyInUse();
        }

        await this.roleRepository.update(existingRole.id, {
            name,
            permissions: mergeDeepLeft(permissions, existingRole.permissions),
            updatedBy: session.email,
        });

        return existingRole.id;
    }
}
