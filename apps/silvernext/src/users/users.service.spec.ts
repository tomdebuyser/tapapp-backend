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
import { JwtService } from '@nestjs/jwt';
import * as faker from 'faker';

import { UserRepository, RoleRepository, UserState } from '@libs/database';
import { MailerService } from '@libs/mailer';
import { LoggerService } from '@libs/logger';
import { UsersService } from './users.service';
import {
    EmailAlreadyInUse,
    RoleNotFound,
    UserNotFound,
    AccountAlreadyActive,
} from './errors';
import { createTestUser, createTestRole } from '@libs/testing';
import { createTestUserSession } from '../shared/testing';
import { CreateUserRequest, UpdateUserRequest } from './dto';

describe('UsersService', () => {
    let module: TestingModule;
    let usersService: UsersService;

    const userRepository = mock(UserRepository);
    const jwtService = mock(JwtService);
    const roleRepository = mock(RoleRepository);
    const mailerService = mock(MailerService);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: LoggerService,
                    useValue: instance(mock(LoggerService)),
                },
                {
                    provide: getCustomRepositoryToken(UserRepository),
                    useValue: instance(userRepository),
                },
                {
                    provide: JwtService,
                    useValue: instance(jwtService),
                },
                {
                    provide: getCustomRepositoryToken(RoleRepository),
                    useValue: instance(roleRepository),
                },
                {
                    provide: MailerService,
                    useValue: instance(mailerService),
                },
            ],
        }).compile();

        usersService = module.get(UsersService);

        when(
            mailerService.sendRegisterMail(anything(), anything(), anything()),
        ).thenResolve();
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
        reset(jwtService);
        reset(roleRepository);
    });

    describe('createUser', () => {
        it('should create a user with email and reset token #1', async () => {
            const request: CreateUserRequest = {
                email: faker.internet.email(),
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName(),
                roleIds: [faker.random.uuid()],
            };
            const resetToken = faker.random.alphaNumeric(10);
            const roles = [createTestRole()];
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );
            when(roleRepository.find(anything())).thenResolve(roles);
            when(userRepository.save(anything())).thenCall(user => ({
                ...user,
                id: faker.random.uuid(),
            }));

            await usersService.createUser(request, session);

            verify(
                userRepository.save(
                    objectContaining({
                        email: request.email,
                        resetToken,
                        state: UserState.Registering,
                        firstName: request.firstName,
                        lastName: request.lastName,
                        roles,
                        createdBy: session.email,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should create a user with email and reset token #2', async () => {
            const request: CreateUserRequest = {
                email: faker.internet.email(),
                roleIds: [faker.random.uuid()],
            };
            const resetToken = faker.random.alphaNumeric(10);
            const roles = [createTestRole()];
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );
            when(roleRepository.find(anything())).thenResolve(roles);
            when(userRepository.save(anything())).thenCall(user => ({
                ...user,
                id: faker.random.uuid(),
            }));

            await usersService.createUser(request, session);

            verify(
                userRepository.save(
                    objectContaining({
                        email: request.email,
                        resetToken,
                        roles,
                        createdBy: session.email,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when a user with email already exists', async () => {
            when(userRepository.findOne(anything())).thenResolve(
                createTestUser(),
            );

            await expect(
                usersService.createUser(
                    {
                        email: faker.internet.email(),
                        roleIds: [faker.random.uuid()],
                    },
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(EmailAlreadyInUse);
        });

        it('should throw an error when a given role does not exist', async () => {
            when(userRepository.findOne(anything())).thenResolve(null);
            when(roleRepository.find(anything())).thenResolve([]);

            await expect(
                usersService.createUser(
                    {
                        email: faker.internet.email(),
                        roleIds: [faker.random.uuid()],
                    },
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(RoleNotFound);
        });
    });

    describe('updateUser', () => {
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

            await usersService.updateUser(request, user.id, session);

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

            await usersService.updateUser(request, user.id, session);

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
                usersService.updateUser(
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
                usersService.updateUser(
                    { roleIds: [faker.random.uuid()] },
                    user.id,
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(RoleNotFound);
        });
    });

    describe('resendRegisterMail', () => {
        it('should resend the register email correctly', async () => {
            const user = createTestUser({ state: UserState.Registering });
            const resetToken = faker.random.alphaNumeric(10);
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );
            when(userRepository.save(anything())).thenCall(user => ({
                ...user,
                id: faker.random.uuid(),
            }));

            await usersService.resendRegisterMail(user.id, session);

            verify(
                userRepository.save(
                    objectContaining({
                        ...user,
                        resetToken,
                        state: UserState.Registering,
                        createdBy: session.email,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should throw an error when the user does not exist', async () => {
            const userId = faker.random.uuid();

            when(userRepository.findOne(anything())).thenResolve(null);

            await expect(
                usersService.resendRegisterMail(
                    userId,
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(UserNotFound);
        });

        it('should throw an error when the user is already active', async () => {
            const user = createTestUser({ state: UserState.Active });

            when(userRepository.findOne(anything())).thenResolve(user);

            await expect(
                usersService.resendRegisterMail(
                    user.id,
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(AccountAlreadyActive);
        });
    });

    describe('deactivateUser', () => {
        it('should deactivate the user correctly', async () => {
            const user = createTestUser({ id: faker.random.uuid() });
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);

            await usersService.deactivateUser(user.id, session);

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
                usersService.deactivateUser(
                    faker.random.uuid(),
                    createTestUserSession(),
                ),
            ).rejects.toThrowError(UserNotFound);
        });
    });
});
