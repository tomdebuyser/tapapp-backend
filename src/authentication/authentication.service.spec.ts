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
import { TokenExpiredError } from 'jsonwebtoken';

import { AuthenticationService } from './authentication.service';
import { UserRepository } from '../database';
import { createTestUser } from '../_util/testing';
import { UserState } from '../_shared/constants';
import { ResetTokenInvalid, ResetTokenExpired } from './errors';

describe('AuthenticationService', () => {
    let authenticationService: AuthenticationService;

    const userRepository = mock(UserRepository);
    const jwtService = mock(JwtService);

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthenticationService,
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

        authenticationService = module.get(AuthenticationService);
    });

    afterEach(() => {
        reset(userRepository);
        reset(jwtService);
    });

    describe('resetPassword', () => {
        it('should reset the password of a user correctly', async () => {
            const newPassword = 'Password1%';
            const resetToken = faker.random.alphaNumeric(10);
            const user = createTestUser({ resetToken });

            when(userRepository.findOne(anything())).thenResolve(user);
            when(jwtService.verifyAsync(resetToken)).thenResolve(null);
            when(jwtService.decode(resetToken)).thenReturn({
                email: user.email,
            });

            await authenticationService.resetPassword({
                newPassword,
                resetToken,
            });

            verify(
                userRepository.save(
                    objectContaining({
                        ...user,
                        state: UserState.Active,
                        resetToken: null,
                    }),
                ),
            ).once();
        });

        it('should throw an error when resetToken is expired', async () => {
            const newPassword = 'Password1%';
            const resetToken = faker.random.alphaNumeric(10);

            when(jwtService.verifyAsync(resetToken)).thenThrow(
                new TokenExpiredError('', 0),
            );

            await expect(
                authenticationService.resetPassword({
                    newPassword,
                    resetToken,
                }),
            ).rejects.toThrowError(ResetTokenExpired);
        });

        it('should throw an error when resetToken is not linked to a user', async () => {
            const newPassword = 'Password1%';
            const resetToken = faker.random.alphaNumeric(10);

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.verifyAsync(resetToken)).thenResolve(null);
            when(jwtService.decode(resetToken)).thenReturn(null);

            await expect(
                authenticationService.resetPassword({
                    newPassword,
                    resetToken,
                }),
            ).rejects.toThrowError(ResetTokenInvalid);
        });

        it('should throw an error when resetToken is linked to another user', async () => {
            const newPassword = 'Password1%';
            const resetToken = faker.random.alphaNumeric(10);
            const user = createTestUser({ resetToken });

            when(userRepository.findOne(anything())).thenResolve({
                ...user,
                email: 'email1@test.com',
            });
            when(jwtService.verifyAsync(resetToken)).thenResolve(null);
            when(jwtService.decode(resetToken)).thenReturn({
                email: 'email2@test.com',
            });

            await expect(
                authenticationService.resetPassword({
                    newPassword,
                    resetToken,
                }),
            ).rejects.toThrowError(ResetTokenInvalid);
        });
    });
});
