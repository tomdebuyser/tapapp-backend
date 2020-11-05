import { Injectable } from '@nestjs/common';

import { LoggerService } from '@libs/logger';
import { RoleRepository, UserRepository } from '@libs/models';
import { RoleInUse, RoleNotFound } from '../roles.errors';
import { RoleIdParam } from '../dto';
import { IHandler } from '@libs/common';

const context = 'DeleteRoleHandler';

export type DeleteRoleCommand = {
    data: RoleIdParam;
};

@Injectable()
export class DeleteRoleHandler implements IHandler<DeleteRoleCommand> {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ data }: DeleteRoleCommand): Promise<void> {
        const { roleId } = data;

        // The role should already exist
        const existingRole = await this.roleRepository.findOne(roleId);
        if (!existingRole) {
            this.logger.warn('Failed to delete: role with id found', {
                context,
                roleId,
            });
            throw new RoleNotFound();
        }

        // The role should not be used anymore
        const userWithRole = await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role', 'role.id = :roleId', { roleId })
            .getOne();
        if (userWithRole) {
            this.logger.warn('Failed to delete role because it is in use', {
                context,
                roleId,
            });
            throw new RoleInUse();
        }

        // Delete the role
        await this.roleRepository.delete({ id: roleId });
    }
}
