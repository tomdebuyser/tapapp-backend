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
import { EmailAlreadyInUse } from '../users.errors';
import { createTestUser } from '@libs/testing';
import { createTestUserSession } from '../../shared/testing';
import { CreateUserRequest } from '../dto';
import { CreateUserHandler } from './create-user.command';

describe('CreateUserHandler', () => {
    let module: TestingModule;
    let handler: CreateUserHandler;

    const userRepository = mock(UserRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                CreateUserHandler,
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

        handler = module.get(CreateUserHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
    });

    describe('execute', () => {
        it('should create a user with email and reset token #1', async () => {
            const request: CreateUserRequest = {
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
            };
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(null);

            await handler.execute({ data: request, session });

            verify(
                userRepository.save(
                    objectContaining({
                        email: request.email,
                        firstName: request.firstName,
                        lastName: request.lastName,
                        createdBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should create a user with email and reset token #2', async () => {
            const request: CreateUserRequest = {
                email: faker.internet.email(),
            };
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(null);

            await handler.execute({ data: request, session });

            verify(
                userRepository.save(
                    objectContaining({
                        email: request.email,
                        createdBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when a user with email already exists', async () => {
            when(userRepository.findOne(anything())).thenResolve(
                createTestUser(),
            );

            await expect(
                handler.execute({
                    data: {
                        email: faker.internet.email(),
                    },
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(EmailAlreadyInUse);
        });
    });
});
