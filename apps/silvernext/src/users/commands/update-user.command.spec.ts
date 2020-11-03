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

import { UserRepository, RoleRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { RoleNotFound, UserNotFound } from '../users.errors';
import { createTestUser, createTestRole } from '@libs/testing';
import { createTestUserSession } from '../../shared/testing';
import { UpdateUserRequest } from '../dto';
import { UpdateUserHandler } from './update-user.command';

describe('UpdateUserHandler', () => {
    let module: TestingModule;
    let handler: UpdateUserHandler;

    const userRepository = mock(UserRepository);
    const roleRepository = mock(RoleRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                UpdateUserHandler,
                {
                    provide: LoggerService,
                    useValue: instance(mock(LoggerService)),
                },
                {
                    provide: getCustomRepositoryToken(UserRepository),
                    useValue: instance(userRepository),
                },
                {
                    provide: getCustomRepositoryToken(RoleRepository),
                    useValue: instance(roleRepository),
                },
            ],
        }).compile();

        handler = module.get(UpdateUserHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
        reset(roleRepository);
    });

    describe('execute', () => {
        it('should update the user correctly #1', async () => {
            const request: UpdateUserRequest = {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                roleIds: [faker.random.uuid(), faker.random.uuid()],
            };
            const user = createTestUser({ id: faker.random.uuid() });
            const session = createTestUserSession();
            const roles = request.roleIds.map(id => createTestRole({ id }));

            when(userRepository.findOne(anything())).thenResolve(user);
            when(roleRepository.find(anything())).thenResolve(roles);
            when(userRepository.save(anything())).thenCall(user => ({
                ...user,
                id: faker.random.uuid(),
            }));

            await handler.execute(request, user.id, session);

            verify(
                userRepository.save(
                    objectContaining({
                        roles,
                        firstName: request.firstName,
                        lastName: request.lastName,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should update the user correctly #2', async () => {
            const request: UpdateUserRequest = {
                roleIds: [faker.random.uuid()],
            };
            const user = createTestUser({ id: faker.random.uuid() });
            const roles = [createTestRole()];
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);
            when(roleRepository.find(anything())).thenResolve(roles);
            when(userRepository.save(anything())).thenCall(user => ({
                ...user,
                id: faker.random.uuid(),
            }));

            await handler.execute(request, user.id, session);

            verify(
                userRepository.save(
                    objectContaining({
                        roles,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when the user does not exist', async () => {
            when(userRepository.findOne(anything())).thenResolve(null);

            await expect(
                handler.execute(
                    {
                        firstName: faker.name.firstName(),
                        lastName: faker.name.lastName(),
                        roleIds: [faker.random.uuid()],
                    },
                    faker.random.uuid(),
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(UserNotFound);
        });

        it('should throw an error when a given role does not exist', async () => {
            const user = createTestUser({ id: faker.random.uuid() });

            when(userRepository.findOne(anything())).thenResolve(user);
            when(roleRepository.find(anything())).thenResolve([]);

            await expect(
                handler.execute(
                    { roleIds: [faker.random.uuid()] },
                    user.id,
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(RoleNotFound);
        });
    });
});
