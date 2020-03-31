import { Injectable } from '@nestjs/common';
import { mergeDeepLeft } from 'ramda';

import { RoleRepository, Role, UserRepository } from '@libs/database';
import { LoggerService } from '@libs/logger';
import { CreateRoleRequest, UpdateRoleRequest } from './dto';
import { RoleNameAlreadyInUse, RoleNotFound, RoleInUse } from './errors';
import { IUserSession } from '../_shared/constants';

const context = 'RolesService';

@Injectable()
export class RolesService {
    constructor(
        private readonly roleRepository: RoleRepository,
        private readonly userRepository: UserRepository,
        private readonly logger: LoggerService,
    ) {}

    async createRole(
        body: CreateRoleRequest,
        session: IUserSession,
    ): Promise<string> {
        const { name, permissions } = body;
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

        const { id } = await this.roleRepository.save(role);
        return id;
    }

    async updateRole(
        body: UpdateRoleRequest,
        roleId: string,
        session: IUserSession,
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
        const otherRole = name
            ? await this.roleRepository.findOne({ name })
            : null;
        if (otherRole && otherRole.id !== roleId) {
            this.logger.warn('Failed to update: role name already in use', {
                context,
                roleId,
                name,
            });
            throw new RoleNameAlreadyInUse();
        }

        existingRole.name = name;
        existingRole.permissions = mergeDeepLeft(
            permissions,
            existingRole.permissions,
        );
        existingRole.updatedBy = session.email;

        await this.roleRepository.save(existingRole);
        return existingRole.id;
    }

    async deleteRole(roleId: string): Promise<void> {
        // The role should already exist
        const existingRole = await this.roleRepository.findOne({ id: roleId });
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
