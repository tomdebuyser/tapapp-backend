import { getCustomRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import {
    mock,
    instance,
    when,
    anything,
    verify,
    objectContaining,
    reset,
} from 'ts-mockito';
import * as faker from 'faker';

import { RolesService } from './roles.service';
import { RoleRepository, Permissions } from '../database';
import { RoleNameAlreadyInUse } from './errors';
import { createTestRole, createDefaultPermissions } from '../_util/testing';

describe('RolesService', () => {
    let rolesService: RolesService;

    const roleRepository = mock(RoleRepository);

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesService,
                {
                    provide: getCustomRepositoryToken(RoleRepository),
                    useValue: instance(roleRepository),
                },
            ],
        }).compile();

        rolesService = module.get(RolesService);
    });

    afterEach(() => {
        reset(roleRepository);
    });

    describe('createRole', () => {
        it('should create a role with name and permissions #1', async () => {
            const name = faker.name.jobTitle();
            const permissions: Permissions = {
                roles: {
                    view: true,
                    edit: true,
                },
                users: {
                    view: true,
                    edit: true,
                },
            };

            when(roleRepository.findOne(anything())).thenResolve(null);

            await rolesService.createRole({ name, permissions });

            verify(
                roleRepository.save(
                    objectContaining({
                        name,
                        permissions: createDefaultPermissions(permissions),
                    }),
                ),
            ).once();
        });

        it('should create a role with name and permissions #2', async () => {
            const name = faker.name.jobTitle();

            when(roleRepository.findOne(anything())).thenResolve(null);

            await rolesService.createRole({ name, permissions: {} });

            verify(
                roleRepository.save(
                    objectContaining({
                        name,
                        permissions: createDefaultPermissions(),
                    }),
                ),
            ).once();
        });

        it('should throw an error when a role with name already exists', async () => {
            const role = createTestRole();
            when(roleRepository.findOne(anything())).thenResolve(role);

            await expect(rolesService.createRole(role)).rejects.toThrowError(
                RoleNameAlreadyInUse,
            );
        });
    });
});
