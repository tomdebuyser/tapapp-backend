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

import { UserRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { UserNotFound } from '../users.errors';
import { createTestUser } from '@libs/testing';
import { createTestUserSession } from '../../shared/testing';
import { UpdateUserRequest } from '../dto';
import { UpdateUserHandler } from './update-user.command';

describe('UpdateUserHandler', () => {
    let module: TestingModule;
    let handler: UpdateUserHandler;

    const userRepository = mock(UserRepository);

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
            ],
        }).compile();

        handler = module.get(UpdateUserHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
    });

    describe('execute', () => {
        it('should update the user correctly #1', async () => {
            const request: UpdateUserRequest = {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
            };
            const user = createTestUser({ id: faker.random.uuid() });
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);
            when(userRepository.save(anything())).thenCall(user => ({
                ...user,
                id: faker.random.uuid(),
            }));

            await handler.execute({
                data: { ...request, userId: user.id },
                session,
            });

            verify(
                userRepository.save(
                    objectContaining({
                        firstName: request.firstName,
                        lastName: request.lastName,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when the user does not exist', async () => {
            when(userRepository.findOne(anything())).thenResolve(null);

            await expect(
                handler.execute({
                    data: {
                        firstName: faker.name.firstName(),
                        lastName: faker.name.lastName(),
                        userId: faker.random.uuid(),
                    },
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(UserNotFound);
        });
    });
});
