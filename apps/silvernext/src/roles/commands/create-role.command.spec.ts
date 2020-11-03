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
import { createTestRole } from '@libs/testing';
import { CreateRoleHandler } from './create-role.command';
import { CreateRoleRequest } from '../dto';
import { createTestUserSession } from '../../shared/testing';
import { createDefaultPermissions } from '../../shared/util';
import { RoleNameAlreadyInUse } from '../roles.errors';

describe('CreateRoleHandler', () => {
    let module: TestingModule;
    let handler: CreateRoleHandler;

    const roleRepository = mock(RoleRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                CreateRoleHandler,
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

        handler = module.get(CreateRoleHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(roleRepository);
    });

    describe('execute', () => {
        it('should create a role with name and permissions #1', async () => {
            const request: CreateRoleRequest = {
                name: faker.name.jobTitle(),
                permissions: {
                    roles: {
                        view: true,
                        edit: true,
                    },
                    users: {
                        view: true,
                        edit: true,
                    },
                },
            };
            const session = createTestUserSession();

            when(roleRepository.findOne(anything())).thenResolve(null);
            when(roleRepository.insert(anything())).thenCall(role => ({
                ...role,
                id: faker.random.uuid(),
            }));

            await handler.execute(request, session);

            verify(
                roleRepository.insert(
                    objectContaining({
                        name: request.name,
                        permissions: createDefaultPermissions(
                            request.permissions,
                        ),
                        createdBy: session.email,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should create a role with name and permissions #2', async () => {
            const request: CreateRoleRequest = {
                name: faker.name.jobTitle(),
                permissions: {},
            };
            const session = createTestUserSession();

            when(roleRepository.findOne(anything())).thenResolve(null);
            when(roleRepository.insert(anything())).thenCall(role => ({
                ...role,
                id: faker.random.uuid(),
            }));

            await handler.execute(request, session);

            verify(
                roleRepository.insert(
                    objectContaining({
                        name: request.name,
                        permissions: createDefaultPermissions(),
                        createdBy: session.email,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when a role with name already exists', async () => {
            const request: CreateRoleRequest = {
                name: faker.name.jobTitle(),
                permissions: {},
            };
            const role = createTestRole();
            when(roleRepository.findOne(anything())).thenResolve(role);

            await expect(
                handler.execute(request, createTestUserSession()),
            ).rejects.toThrowError(RoleNameAlreadyInUse);
        });
    });
});
