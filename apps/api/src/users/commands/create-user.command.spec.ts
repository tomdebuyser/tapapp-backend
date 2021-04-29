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
import { EmailAlreadyInUse, RoleNotFound } from '../users.errors';
import { createTestUser, createTestRole } from '@libs/testing';
import { createTestUserSession } from '../../shared/testing';
import { CreateUserRequest } from '../dto';
import { CreateUserHandler } from './create-user.command';
import { RegisterMailService } from '../services/register-mail.service';

describe('CreateUserHandler', () => {
    let module: TestingModule;
    let handler: CreateUserHandler;

    const userRepository = mock(UserRepository);
    const roleRepository = mock(RoleRepository);
    const registerMailService = mock(RegisterMailService);

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
                {
                    provide: getCustomRepositoryToken(RoleRepository),
                    useValue: instance(roleRepository),
                },
                {
                    provide: RegisterMailService,
                    useValue: instance(registerMailService),
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
        reset(roleRepository);
        reset(registerMailService);
    });

    describe('execute', () => {
        it('should create a user with email and reset token #1', async () => {
            const request: CreateUserRequest = {
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                roleIds: [faker.random.uuid()],
            };
            const roles = [createTestRole()];
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(null);
            when(
                registerMailService.sendMail(anything(), anything()),
            ).thenResolve(null);
            when(roleRepository.find(anything())).thenResolve(roles);

            await handler.execute({ data: request, session });

            verify(
                userRepository.save(
                    objectContaining({
                        email: request.email,
                        firstName: request.firstName,
                        lastName: request.lastName,
                        roles,
                        createdBy: session.email,
                    }),
                ),
            ).once();
            verify(registerMailService.sendMail(anything(), session)).once();
        });

        it('should create a user with email and reset token #2', async () => {
            const request: CreateUserRequest = {
                email: faker.internet.email(),
                roleIds: [faker.random.uuid()],
            };
            const roles = [createTestRole()];
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(null);
            when(
                registerMailService.sendMail(anything(), anything()),
            ).thenResolve(null);
            when(roleRepository.find(anything())).thenResolve(roles);

            await handler.execute({ data: request, session });

            verify(
                userRepository.save(
                    objectContaining({
                        email: request.email,
                        roles,
                        createdBy: session.email,
                    }),
                ),
            ).once();
            verify(registerMailService.sendMail(anything(), session)).once();
        });

        it('should throw an error when a user with email already exists', async () => {
            when(userRepository.findOne(anything())).thenResolve(
                createTestUser(),
            );

            await expect(
                handler.execute({
                    data: {
                        email: faker.internet.email(),
                        roleIds: [faker.random.uuid()],
                    },
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(EmailAlreadyInUse);
        });

        it('should throw an error when a given role does not exist', async () => {
            when(userRepository.findOne(anything())).thenResolve(null);
            when(roleRepository.find(anything())).thenResolve([]);

            await expect(
                handler.execute({
                    data: {
                        email: faker.internet.email(),
                        roleIds: [faker.random.uuid()],
                    },
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(RoleNotFound);
        });
    });
});
