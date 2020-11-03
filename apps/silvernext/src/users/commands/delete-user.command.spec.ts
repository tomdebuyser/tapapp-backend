import { getCustomRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, instance, when, anything, verify, reset } from 'ts-mockito';
import * as faker from 'faker';

import { UserRepository } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { CannotDeleteCurrentUser, UserNotFound } from '../users.errors';
import { createTestUser } from '@libs/testing';
import { createTestUserSession } from '../../shared/testing';
import { DeleteUserHandler } from './delete-user.command';

describe('DeleteUserHandler', () => {
    let module: TestingModule;
    let handler: DeleteUserHandler;

    const userRepository = mock(UserRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                DeleteUserHandler,
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

        handler = module.get(DeleteUserHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
    });

    describe('execute', () => {
        it('should delete a user correctly', async () => {
            const user = createTestUser();
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);

            await handler.execute(user.id, session);

            verify(userRepository.delete(user.id)).once();
        });

        it('should throw an error when the user does nog exist', async () => {
            when(userRepository.findOne(anything())).thenResolve(null);

            await expect(
                handler.execute(faker.random.uuid(), createTestUserSession()),
            ).rejects.toThrowError(UserNotFound);
        });

        it('should throw an error when a user with email already exists', async () => {
            const userId = faker.random.uuid();
            const user = createTestUser({ id: userId });
            const session = createTestUserSession({ userId });

            when(userRepository.findOne(anything())).thenResolve(user);

            await expect(
                handler.execute(user.id, session),
            ).rejects.toThrowError(CannotDeleteCurrentUser);
        });
    });
});
