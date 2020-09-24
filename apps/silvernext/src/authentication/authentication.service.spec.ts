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
    capture,
} from 'ts-mockito';
import { JwtService } from '@nestjs/jwt';
import * as faker from 'faker';
import { TokenExpiredError } from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { LoggerService } from '@libs/logger';
import { UserRepository, UserState } from '@libs/models';
import { MailerService } from '@libs/mailer';
import { AuthenticationService } from './authentication.service';
import { createTestUser } from '@libs/testing';
import {
    ResetTokenInvalid,
    ResetTokenExpired,
    InvalidOldPassword,
    UserStateNotAllowed,
} from './errors';
import {
    RequestPasswordResetRequest,
    ResetPasswordRequest,
    ChangePasswordRequest,
} from './dto';

describe('AuthenticationService', () => {
    let module: TestingModule;
    let authService: AuthenticationService;

    const userRepository = mock(UserRepository);
    const jwtService = mock(JwtService);
    const mailerService = mock(MailerService);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                AuthenticationService,
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
                    provide: MailerService,
                    useValue: instance(mailerService),
                },
            ],
        }).compile();

        authService = module.get(AuthenticationService);

        when(
            mailerService.sendRequestPasswordResetMail(anything(), anything()),
        ).thenResolve();
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
        reset(jwtService);
    });

    describe('login', () => {
        it('should validate the login credentials correctly', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const hashedPassword = await authService.hashPassword(password);
            const user = createTestUser({ email, password: hashedPassword });

            when(userRepository.findOne(anything())).thenResolve(user);

            expect(await authService.login(email, password)).toBeTruthy();
        });

        it('should throw an error when the linked user is not found', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            when(userRepository.findOne(anything())).thenResolve(null);

            await expect(
                authService.login(email, password),
            ).rejects.toThrowError(UnauthorizedException);
        });

        it('should throw an error when the user is not active', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const user = createTestUser({
                email,
                password,
                state: UserState.Registering,
            });

            when(userRepository.findOne(anything())).thenResolve(user);

            await expect(
                authService.login(email, password),
            ).rejects.toThrowError(UserStateNotAllowed);
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
                authService.login(email, password),
            ).rejects.toThrowError(UnauthorizedException);
        });
    });

    describe('requestPasswordReset', () => {
        it('should handle the request for password reset correctly', async () => {
            const request: RequestPasswordResetRequest = {
                email: faker.internet.email(),
            };
            const resetToken = faker.random.alphaNumeric(10);

            when(userRepository.findOne(anything())).thenResolve(
                createTestUser({ email: request.email }),
            );
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );

            await authService.requestPasswordReset(request);

            verify(
                userRepository.save(
                    objectContaining({
                        email: request.email,
                        resetToken,
                    }),
                ),
            ).once();
        });

        it('should do nothing when no user was found for the given email', async () => {
            const request: RequestPasswordResetRequest = {
                email: faker.internet.email(),
            };

            when(userRepository.findOne(anything())).thenResolve(null);

            await authService.requestPasswordReset(request);

            verify(userRepository.save(anything())).never();
        });
    });

    describe('resetPassword', () => {
        it('should reset the password of a user correctly', async () => {
            const request: ResetPasswordRequest = {
                newPassword: 'Password1%',
                resetToken: faker.random.alphaNumeric(10),
            };
            const user = createTestUser({ resetToken: request.resetToken });

            when(userRepository.findOne(anything())).thenResolve(user);
            when(jwtService.verifyAsync(request.resetToken)).thenResolve(null);
            when(jwtService.decode(request.resetToken)).thenReturn({
                email: user.email,
            });

            await authService.resetPassword(request);

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
            const request: ResetPasswordRequest = {
                newPassword: 'Password1%',
                resetToken: faker.random.alphaNumeric(10),
            };

            when(jwtService.verifyAsync(request.resetToken)).thenThrow(
                new TokenExpiredError('', new Date()),
            );

            await expect(
                authService.resetPassword(request),
            ).rejects.toThrowError(ResetTokenExpired);
        });

        it('should throw an error when resetToken could not be verified', async () => {
            const request: ResetPasswordRequest = {
                newPassword: 'Password1%',
                resetToken: faker.random.alphaNumeric(10),
            };

            when(jwtService.verifyAsync(request.resetToken)).thenThrow(
                new Error(),
            );

            await expect(
                authService.resetPassword(request),
            ).rejects.toThrowError(ResetTokenInvalid);
        });

        it('should throw an error when resetToken is not linked to a user', async () => {
            const request: ResetPasswordRequest = {
                newPassword: 'Password1%',
                resetToken: faker.random.alphaNumeric(10),
            };

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.verifyAsync(request.resetToken)).thenResolve(null);
            when(jwtService.decode(request.resetToken)).thenReturn(null);

            await expect(
                authService.resetPassword(request),
            ).rejects.toThrowError(ResetTokenInvalid);
        });

        it('should throw an error when resetToken is linked to another user', async () => {
            const request: ResetPasswordRequest = {
                newPassword: 'Password1%',
                resetToken: faker.random.alphaNumeric(10),
            };
            const user = createTestUser({ resetToken: request.resetToken });

            when(userRepository.findOne(anything())).thenResolve({
                ...user,
                email: 'email1@test.com',
            });
            when(jwtService.verifyAsync(request.resetToken)).thenResolve(null);
            when(jwtService.decode(request.resetToken)).thenReturn({
                email: 'email2@test.com',
            });

            await expect(
                authService.resetPassword(request),
            ).rejects.toThrowError(ResetTokenInvalid);
        });

        it('should throw an error when the user is inactive', async () => {
            const request: ResetPasswordRequest = {
                newPassword: 'Password1%',
                resetToken: faker.random.alphaNumeric(10),
            };
            const user = createTestUser({
                resetToken: request.resetToken,
                state: UserState.Inactive,
            });

            when(userRepository.findOne(anything())).thenResolve(user);
            when(jwtService.verifyAsync(request.resetToken)).thenResolve(null);
            when(jwtService.decode(request.resetToken)).thenReturn({
                email: user.email,
            });

            await expect(
                authService.resetPassword(request),
            ).rejects.toThrowError(UserStateNotAllowed);
        });
    });

    describe('changePassword', () => {
        it('should successfully change password', async () => {
            const request: ChangePasswordRequest = {
                oldPassword: 'my_old_password',
                newPassword: 'my_new_password',
            };

            when(userRepository.findOne(anything())).thenResolve(
                createTestUser({
                    password: bcrypt.hashSync(request.oldPassword, 10),
                }),
            );

            await authService.changePassword(request, faker.random.uuid());

            const [savedUser] = capture(userRepository.save).last();
            expect(
                bcrypt.compareSync(request.newPassword, savedUser.password),
            ).toBe(true);
        });

        it('should fail when the old password is wrong', async () => {
            const request: ChangePasswordRequest = {
                oldPassword: 'my_invalid_old_password',
                newPassword: 'my_new_password',
            };

            when(userRepository.findOne(anything())).thenResolve(
                createTestUser({ password: 'my_old_password' }),
            );

            await expect(
                authService.changePassword(request, faker.random.uuid()),
            ).rejects.toThrowError(InvalidOldPassword);
        });
    });
});
