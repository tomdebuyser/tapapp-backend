import { Injectable } from '@nestjs/common';

import { RoleRepository, Role } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { CreateRoleRequest } from '../dto';
import { UserSession } from '../../shared/constants';
import { RoleNameAlreadyInUse } from '../roles.errors';
import { IHandler } from '@libs/common';

const context = 'CreateRoleHandler';

export type CreateRoleCommand = {
    data: CreateRoleRequest;
    session: UserSession;
};

@Injectable()
export class CreateRoleHandler implements IHandler<CreateRoleCommand> {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly logger: LoggerService,
    ) {}

    async execute({ data, session }: CreateRoleCommand): Promise<string> {
        const { name, permissions } = data;
        const existingRole = await this.roleRepository.findOne({ name });
        if (existingRole) {
            this.logger.warn('Failed to create: role name already in use', {
                context,
                name,
            });
            throw new RoleNameAlreadyInUse();
        }

        const role = Role.create({
            name,
            permissions: {
                roles: {
                    view: permissions.roles?.view || false,
                    edit: permissions.roles?.edit || false,
                },
                users: {
                    view: permissions.users?.view || false,
                    edit: permissions.users?.edit || false,
                },
            },
            createdBy: session.email,
            updatedBy: session.email,
        });
        await this.roleRepository.insert(role);

        return role.id;
    }
}
