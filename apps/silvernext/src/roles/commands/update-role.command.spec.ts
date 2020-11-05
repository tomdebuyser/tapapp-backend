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

import { RoleRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { RoleNameAlreadyInUse, RoleNotFound } from '../roles.errors';
import { createTestRole } from '@libs/testing';
import { UpdateRoleHandler } from './update-role.command';
import { UpdateRoleRequest } from '../dto';
import { createTestUserSession } from '../../shared/testing';
import { createDefaultPermissions } from '../../shared/util';

describe('UpdateRoleHandler', () => {
    let module: TestingModule;
    let handler: UpdateRoleHandler;

    const roleRepository = mock(RoleRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                UpdateRoleHandler,
                {
                    provide: LoggerService,
                    useValue: instance(mock(LoggerService)),
                },
                {
                    provide: getCustomRepositoryToken(RoleRepository),
                    useValue: instance(roleRepository),
                },
            ],
        }).compile();

        handler = module.get(UpdateRoleHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(roleRepository);
    });

    describe('execute', () => {
        it('should update the role correctly #1', async () => {
            const request: UpdateRoleRequest = {
                name: faker.name.jobTitle(),
                permissions: {
                    roles: {
                        edit: true,
                    },
                    users: {
                        view: true,
                    },
                },
            };
            const role = createTestRole();
            const session = createTestUserSession();

            when(roleRepository.findOne(anything())).thenResolve(role);
            when(roleRepository.update(anything(), anything())).thenCall(
                role => ({
                    ...role,
                    id: faker.random.uuid(),
                }),
            );

            await handler.execute({
                data: { roleId: role.id, ...request },
                session,
            });

            verify(
                roleRepository.update(
                    role.id,
                    objectContaining({
                        name: request.name,
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
            const request: UpdateRoleRequest = {
                name: faker.name.jobTitle(),
                permissions: createDefaultPermissions(),
            };
            const role = createTestRole();
            const session = createTestUserSession();

            when(roleRepository.findOne(anything())).thenResolve(role);
            when(roleRepository.update(anything(), anything())).thenCall(
                role => ({
                    ...role,
                    id: faker.random.uuid(),
                }),
            );

            await handler.execute({
                data: { roleId: role.id, ...request },
                session,
            });

            verify(
                roleRepository.update(
                    role.id,
                    objectContaining({
                        name: request.name,
                        permissions: request.permissions,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when the role does not exist', async () => {
            const request: UpdateRoleRequest = {
                name: faker.name.jobTitle(),
                permissions: createDefaultPermissions(),
            };

            when(roleRepository.findOne(anything())).thenResolve(null);

            await expect(
                handler.execute({
                    data: { roleId: faker.random.uuid(), ...request },
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(RoleNotFound);
        });

        it('should throw an error when another role with the name already exists', async () => {
            const request: UpdateRoleRequest = {
                name: faker.name.jobTitle(),
                permissions: createDefaultPermissions(),
            };
            const roleId = faker.random.uuid();
            const role = createTestRole({ id: roleId });

            when(roleRepository.findOne(roleId)).thenResolve(role);
            when(
                roleRepository.findOne(
                    objectContaining({ name: request.name }),
                ),
            ).thenResolve(createTestRole({ id: faker.random.uuid() }));

            await expect(
                handler.execute({
                    data: { roleId, ...request },
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(RoleNameAlreadyInUse);
        });
    });
});
