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

import { RoleRepository, UserRepository, User } from '@libs/database';
import { LoggerService } from '@libs/logger';
import { RolesService } from './roles.service';
import { RoleNameAlreadyInUse, RoleNotFound, RoleInUse } from './errors';
import {
    createTestRole,
    createTestUserSession,
    createTestUser,
} from '../_util/testing';
import { PermissionsDto } from './dto';
import { QueryBuilderMock } from '../_util/mocks';
import { createDefaultPermissions } from '../_util/permissions.helper';

describe('RolesService', () => {
    let rolesService: RolesService;

    const roleRepository = mock(RoleRepository);
    const userRepository = mock(UserRepository);

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RolesService,
                {
                    provide: LoggerService,
                    useValue: instance(mock(LoggerService)),
                },
                {
                    provide: getCustomRepositoryToken(RoleRepository),
                    useValue: instance(roleRepository),
                },
                {
                    provide: getCustomRepositoryToken(UserRepository),
                    useValue: instance(userRepository),
                },
            ],
        }).compile();

        rolesService = module.get(RolesService);
    });

    afterEach(() => {
        reset(roleRepository);
        reset(userRepository);
    });

    describe('createRole', () => {
        it('should create a role with name and permissions #1', async () => {
            const name = faker.name.jobTitle();
            const permissions: PermissionsDto = {
                roles: {
                    view: true,
                    edit: true,
                },
                users: {
                    view: true,
                    edit: true,
                },
            };
            const session = createTestUserSession();

            when(roleRepository.findOne(anything())).thenResolve(null);

            await rolesService.createRole({ name, permissions }, session);

            verify(
                roleRepository.save(
                    objectContaining({
                        name,
                        permissions: createDefaultPermissions(permissions),
                        createdBy: session.email,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should create a role with name and permissions #2', async () => {
            const name = faker.name.jobTitle();
            const session = createTestUserSession();

            when(roleRepository.findOne(anything())).thenResolve(null);

            await rolesService.createRole({ name, permissions: {} }, session);

            verify(
                roleRepository.save(
                    objectContaining({
                        name,
                        permissions: createDefaultPermissions(),
                        createdBy: session.email,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when a role with name already exists', async () => {
            const role = createTestRole();
            when(roleRepository.findOne(anything())).thenResolve(role);

            await expect(
                rolesService.createRole(role, createTestUserSession()),
            ).rejects.toThrowError(RoleNameAlreadyInUse);
        });
    });

    describe('updateRole', () => {
        it('should update the role correctly #1', async () => {
            const permissions: PermissionsDto = {
                roles: {
                    edit: true,
                },
                users: {
                    view: true,
                },
            };
            const role = createTestRole();
            const session = createTestUserSession();

            when(roleRepository.findOne(anything())).thenResolve(role);

            await rolesService.updateRole({ permissions }, role.id, session);

            verify(
                roleRepository.save(
                    objectContaining({
                        permissions: {
                            roles: {
                                view: role.permissions.roles.view,
                                edit: true,
                            },
                            users: {
                                view: true,
                                edit: role.permissions.users.edit,
                            },
                        },
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should update the role correctly #2', async () => {
            const name = faker.name.jobTitle();
            const role = createTestRole();
            const session = createTestUserSession();

            when(roleRepository.findOne(anything())).thenResolve(role);

            await rolesService.updateRole({ name }, role.id, session);

            verify(
                roleRepository.save(
                    objectContaining({
                        name,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when the role does not exist', async () => {
            when(roleRepository.findOne(anything())).thenResolve(null);

            await expect(
                rolesService.updateRole(
                    {},
                    faker.random.uuid(),
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(RoleNotFound);
        });

        it('should throw an error when another role with the name already exists', async () => {
            const name = faker.name.jobTitle();
            const roleId = faker.random.uuid();
            const role = createTestRole({ id: roleId });
            when(
                roleRepository.findOne(objectContaining({ id: roleId })),
            ).thenResolve(role);
            when(
                roleRepository.findOne(objectContaining({ name })),
            ).thenResolve(createTestRole({ id: faker.random.uuid() }));

            await expect(
                rolesService.updateRole(
                    { name },
                    roleId,
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(RoleNameAlreadyInUse);
        });
    });

    describe('deleteRole', () => {
        it('should delete the role correctly', async () => {
            const role = createTestRole({ id: faker.random.uuid() });
            when(roleRepository.findOne(anything())).thenResolve(role);
            when(userRepository.createQueryBuilder(anything())).thenReturn(
                QueryBuilderMock.instance<User>(null),
            );

            await rolesService.deleteRole(role.id);

            verify(
                roleRepository.delete(
                    objectContaining({
                        id: role.id,
                    }),
                ),
            ).once();
        });

        it('should throw an error when the role does not exist', async () => {
            when(roleRepository.findOne(anything())).thenResolve(null);

            await expect(
                rolesService.deleteRole(faker.random.uuid()),
            ).rejects.toThrowError(RoleNotFound);
        });

        it('should throw an error when the role is still in use', async () => {
            const role = createTestRole({ id: faker.random.uuid() });
            when(roleRepository.findOne(anything())).thenResolve(role);
            when(userRepository.createQueryBuilder(anything())).thenReturn(
                QueryBuilderMock.instance<User>(createTestUser()),
            );

            await expect(rolesService.deleteRole(role.id)).rejects.toThrowError(
                RoleInUse,
            );
        });
    });
});
