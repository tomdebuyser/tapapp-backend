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
import { UnauthorizedException } from '@nestjs/common';

import { AuthenticationService } from './authentication.service';
import { UserRepository } from '../database';
import { createTestUser } from '../_util/testing';
import { UserState } from '../_shared/constants';
import { ResetTokenInvalid, ResetTokenExpired } from './errors';

describe('AuthenticationService', () => {
    let authService: AuthenticationService;

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

        authService = module.get(AuthenticationService);
    });

    afterEach(() => {
        reset(userRepository);
        reset(jwtService);
    });

    describe('validateCredentials', () => {
        it('should validate the login credentials correctly', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const hashedPassword = await authService.hashPassword(password);
            const user = createTestUser({ email, password: hashedPassword });

            when(userRepository.findOne(anything())).thenResolve(user);

            expect(
                await authService.validateCredentials(email, password),
            ).toBeTruthy();
        });

        it('should throw an error when the linked user is not found', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            when(userRepository.findOne(anything())).thenResolve(null);

            await expect(
                authService.validateCredentials(email, password),
            ).rejects.toThrowError(UnauthorizedException);
        });

        it('should throw an error when the passwords do not match', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const hashedPassword = await authService.hashPassword(
                `_${password}`,
            );
            const user = createTestUser({ email, password: hashedPassword });

            when(userRepository.findOne(anything())).thenResolve(user);

            await expect(
                authService.validateCredentials(email, password),
            ).rejects.toThrowError(UnauthorizedException);
        });
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

            await authService.resetPassword({
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
                authService.resetPassword({
                    newPassword,
                    resetToken,
                }),
            ).rejects.toThrowError(ResetTokenExpired);
        });

        it('should throw an error when resetToken could not be verified', async () => {
            const newPassword = 'Password1%';
            const resetToken = faker.random.alphaNumeric(10);

            when(jwtService.verifyAsync(resetToken)).thenThrow(new Error());

            await expect(
                authService.resetPassword({
                    newPassword,
                    resetToken,
                }),
            ).rejects.toThrowError(ResetTokenInvalid);
        });

        it('should throw an error when resetToken is not linked to a user', async () => {
            const newPassword = 'Password1%';
            const resetToken = faker.random.alphaNumeric(10);

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.verifyAsync(resetToken)).thenResolve(null);
            when(jwtService.decode(resetToken)).thenReturn(null);

            await expect(
                authService.resetPassword({
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
                authService.resetPassword({
                    newPassword,
                    resetToken,
                }),
            ).rejects.toThrowError(ResetTokenInvalid);
        });
    });
});
