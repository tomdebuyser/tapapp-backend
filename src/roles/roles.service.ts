import { Injectable } from '@nestjs/common';
import { mergeDeepLeft } from 'ramda';

import { RoleRepository, Role, UserRepository } from '../database';
import { CreateRoleRequest, UpdateRoleRequest } from './dto';
import { RoleNameAlreadyInUse, RoleNotFound, RoleInUse } from './errors';
import { IUserSession } from '../_shared/constants';

@Injectable()
export class RolesService {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async createRole(
        body: CreateRoleRequest,
        session: IUserSession,
    ): Promise<string> {
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
        role.createdBy = session.email;
        role.updatedBy = session.email;

        await this.roleRepository.save(role);

        return role.id;
    }

    async updateRole(
        body: UpdateRoleRequest,
        roleId: string,
        session: IUserSession,
    ): Promise<string> {
        const { name, permissions } = body;

        // The role should already exist
        const existingRole = await this.roleRepository.findOne({ id: roleId });
        if (!existingRole) {
            throw new RoleNotFound();
        }

        // There should not exist another role with the given name
        const otherRole = name
            ? await this.roleRepository.findOne({ name })
            : null;
        if (otherRole && otherRole.id !== roleId) {
            throw new RoleNameAlreadyInUse();
        }

        // Update the properties if provided
        if (name) existingRole.name = name;
        if (permissions) {
            existingRole.permissions = mergeDeepLeft(
                permissions,
                existingRole.permissions,
            );
        }
        existingRole.updatedBy = session.userId;

        await this.roleRepository.save(existingRole);

        return existingRole.id;
    }

    async deleteRole(roleId: string): Promise<void> {
        // The role should already exist
        const existingRole = await this.roleRepository.findOne({ id: roleId });
        if (!existingRole) {
            throw new RoleNotFound();
        }

        // The role should not be used anymore
        const userWithRole = await this.userRepository
            .createQueryBuilder('user')
            .innerJoin('user.roles', 'role', 'role.id = :roleId', { roleId })
            .getOne();
        if (userWithRole) {
            throw new RoleInUse();
        }

        // Delete the role
        await this.roleRepository.delete({ id: roleId });
    }
}
