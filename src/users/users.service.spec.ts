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

import { UsersService } from './users.service';
import { UserRepository, RoleRepository } from '../database';
import {
    EmailAlreadyInUse,
    RoleNotFound,
    UserNotFound,
    AccountAlreadyActive,
} from './errors';
import {
    createTestUser,
    createTestRole,
    createTestUserSession,
} from '../_util/testing';
import { MailerService } from '../mailer/mailer.service';
import { UserState } from '../_shared/constants';
import { LoggerService } from '../logger/logger.service';

describe('UsersService', () => {
    let usersService: UsersService;

    const userRepository = mock(UserRepository);
    const jwtService = mock(JwtService);
    const roleRepository = mock(RoleRepository);
    const mailerService = mock(MailerService);

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                LoggerService,
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
    });

    afterEach(() => {
        reset(userRepository);
        reset(jwtService);
        reset(roleRepository);
    });

    describe('createUser', () => {
        it('should create a user with email and reset token #1', async () => {
            const email = faker.internet.email();
            const firstName = faker.name.firstName();
            const lastName = faker.name.lastName();
            const roleIds = [faker.random.uuid()];
            const resetToken = faker.random.alphaNumeric(10);
            const roles = [createTestRole()];
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );
            when(roleRepository.find(anything())).thenResolve(roles);

            await usersService.createUser(
                { email, firstName, lastName, roleIds },
                session,
                'origin',
            );

            verify(
                userRepository.save(
                    objectContaining({
                        email,
                        resetToken,
                        state: UserState.Registering,
                        firstName,
                        lastName,
                        roles,
                        createdBy: session.email,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should create a user with email and reset token #2', async () => {
            const email = faker.internet.email();
            const roleIds = [faker.random.uuid()];
            const resetToken = faker.random.alphaNumeric(10);
            const roles = [createTestRole()];
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );
            when(roleRepository.find(anything())).thenResolve(roles);

            await usersService.createUser(
                { email, roleIds },
                session,
                'origin',
            );

            verify(
                userRepository.save(
                    objectContaining({
                        email,
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
                    'origin',
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
                    'origin',
                ),
            ).rejects.toThrowError(RoleNotFound);
        });
    });

    describe('updateUser', () => {
        it('should update the user correctly #1', async () => {
            const firstName = faker.name.firstName();
            const lastName = faker.name.lastName();
            const user = createTestUser({ id: faker.random.uuid() });
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);
            when(roleRepository.find(anything())).thenResolve([]);

            await usersService.updateUser(
                { firstName, lastName },
                user.id,
                session,
            );

            verify(
                userRepository.save(
                    objectContaining({
                        firstName,
                        lastName,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });

        it('should update the user correctly #2', async () => {
            const roleIds = [faker.random.uuid()];
            const user = createTestUser({ id: faker.random.uuid() });
            const roles = [createTestRole()];
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);
            when(roleRepository.find(anything())).thenResolve(roles);

            await usersService.updateUser({ roleIds }, user.id, session);

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
                    {},
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

            await usersService.resendRegisterMail(user.id, session, 'origin');

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
                    'origin',
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
                    'origin',
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
