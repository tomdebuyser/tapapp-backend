import { Injectable } from '@nestjs/common';
import { mergeDeepLeft } from 'ramda';

import { LoggerService } from '@libs/logger';
import { RoleRepository } from '@libs/models';
import { IHandler } from '@libs/common';
import { UserSession } from '../../shared/constants';
import { RoleIdParam, UpdateRoleRequest } from '../dto';
import { RoleNameAlreadyInUse, RoleNotFound } from '../roles.errors';

const context = 'UpdateRoleHandler';

export type UpdateRoleCommand = {
    data: UpdateRoleRequest & RoleIdParam;
    session: UserSession;
};

@Injectable()
export class UpdateRoleHandler implements IHandler<UpdateRoleCommand> {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ session, data }: UpdateRoleCommand): Promise<string> {
        const { roleId } = data;

        // The role should already exist
        const existingRole = await this.roleRepository.findOne(roleId);
        if (!existingRole) {
            this.logger.warn('Failed to update: role with id not found', {
                context,
                roleId,
            });
            throw new RoleNotFound();
        }

        // There should not exist another role with the given name
        const { name, permissions } = data;
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
