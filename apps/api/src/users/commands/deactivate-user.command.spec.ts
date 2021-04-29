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

import { UserRepository, UserState } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { UserNotFound } from '../users.errors';
import { createTestUser } from '@libs/testing';
import { createTestUserSession } from '../../shared/testing';
import { DeactivateUserHandler } from './deactivate-user.command';

describe('DeactivateUserHandler', () => {
    let module: TestingModule;
    let handler: DeactivateUserHandler;

    const userRepository = mock(UserRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                DeactivateUserHandler,
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

        handler = module.get(DeactivateUserHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
    });

    describe('execute', () => {
        it('should deactivate the user correctly', async () => {
            const user = createTestUser({ id: faker.datatype.uuid() });
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);

            await handler.execute({ data: { userId: user.id }, session });

            verify(
                userRepository.update(
                    user.id,
                    objectContaining({
                        state: UserState.Inactive,
                        resetToken: null,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when the user does not exist', async () => {
            when(userRepository.findOne(anything())).thenResolve(null);

            await expect(
                handler.execute({
                    data: { userId: faker.datatype.uuid() },
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(UserNotFound);
        });
    });
});
