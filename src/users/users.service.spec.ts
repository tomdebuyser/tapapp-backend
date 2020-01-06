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
import { UserRepository } from '../database';
import { EmailAlreadyInUse } from './errors';
import { createTestUser } from '../_util/testing';

describe('UsersService', () => {
    let userService: UsersService;

    const userRepository = mock(UserRepository);
    const jwtService = mock(JwtService);

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
            ],
        }).compile();

        userService = module.get(UsersService);
    });

    afterEach(() => {
        reset(userRepository);
        reset(jwtService);
    });

    describe('createUser', () => {
        it('should create a user with email and reset token', async () => {
            const email = faker.internet.email();
            const token = faker.random.alphaNumeric(10);

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.sign(anything(), anything())).thenReturn(token);

            await userService.createUser({ email });

            verify(
                userRepository.save(
                    objectContaining({ email, resetToken: token }),
                ),
            ).once();
        });

        it('should throw an error when a user with email already exists', async () => {
            when(userRepository.findOne(anything())).thenResolve(
                createTestUser(),
            );

            await expect(
                userService.createUser({ email: 'doesntmatter@mail.com' }),
            ).rejects.toThrowError(EmailAlreadyInUse);
        });
    });
});
