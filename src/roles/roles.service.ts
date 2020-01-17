import { Injectable } from '@nestjs/common';

import { RoleRepository, Role } from '../database';
import { CreateRoleRequest } from './dto';
import { RoleNameAlreadyInUse } from './errors';
import { IUserSession } from '../_shared/constants';

@Injectable()
export class RolesService {
    constructor(private readonly roleRepository: RoleRepository) {}

    async createRole(
        body: CreateRoleRequest,
        session: IUserSession,
    ): Promise<void> {
        const { name, permissions } = body;
        const existingRole = await this.roleRepository.findOne({ name });
        if (existingRole) {
            throw new RoleNameAlreadyInUse();
        }

        const role = new Role();
        role.name = name;
        role.permissions = {
            roles: {
                view: permissions.roles?.view || false,
                edit: permissions.roles?.edit || false,
            },
            users: {
                view: permissions.users?.view || false,
                edit: permissions.users?.edit || false,
            },
        };
        role.createdBy = session.userId;
        role.updatedBy = session.userId;

        await this.roleRepository.save(role);
    }
}
