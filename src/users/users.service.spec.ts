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
import { EmailAlreadyInUse, RoleNotFound } from './errors';
import { createTestUser, createTestRole } from '../_util/testing';
import { MailerService } from '../mailer/mailer.service';

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

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );
            when(roleRepository.find(anything())).thenResolve(roles);

            await usersService.createUser(
                { email, firstName, lastName, roleIds },
                'origin',
            );

            verify(
                userRepository.save(
                    objectContaining({
                        email,
                        resetToken,
                        firstName,
                        lastName,
                        roles,
                    }),
                ),
            ).once();
        });

        it('should create a user with email and reset token #2', async () => {
            const email = faker.internet.email();
            const roleIds = [faker.random.uuid()];
            const resetToken = faker.random.alphaNumeric(10);
            const roles = [createTestRole()];

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );
            when(roleRepository.find(anything())).thenResolve(roles);

            await usersService.createUser({ email, roleIds }, 'origin');

            verify(
                userRepository.save(
                    objectContaining({
                        email,
                        resetToken,
                        roles,
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
                    'origin',
                ),
            ).rejects.toThrowError(RoleNotFound);
        });
    });
});
