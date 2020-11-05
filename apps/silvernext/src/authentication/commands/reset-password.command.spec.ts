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

import { LoggerService } from '@libs/logger';
import { UserRepository, UserState } from '@libs/models';
import { createTestUser } from '@libs/testing';
import {
    ResetTokenInvalid,
    ResetTokenExpired,
    UserStateNotAllowed,
} from '../authentication.errors';
import {
    ResetPasswordCommand,
    ResetPasswordHandler,
} from './reset-password.command';

describe('ResetPasswordHandler', () => {
    let module: TestingModule;
    let handler: ResetPasswordHandler;

    const userRepository = mock(UserRepository);
    const jwtService = mock(JwtService);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                ResetPasswordHandler,
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
            ],
        }).compile();

        handler = module.get(ResetPasswordHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
        reset(jwtService);
    });

    describe('execute', () => {
        it('should reset the password of a user correctly', async () => {
            const command: ResetPasswordCommand = {
                data: {
                    newPassword: 'Password1%',
                    resetToken: faker.random.alphaNumeric(10),
                },
            };
            const user = createTestUser({
                resetToken: command.data.resetToken,
            });

            when(userRepository.findOne(anything())).thenResolve(user);
            when(jwtService.verifyAsync(command.data.resetToken)).thenResolve(
                null,
            );
            when(jwtService.decode(command.data.resetToken)).thenReturn({
                email: user.email,
            });

            await handler.execute(command);

            verify(
                userRepository.update(
                    user.id,
                    objectContaining({
                        state: UserState.Active,
                        resetToken: null,
                    }),
                ),
            ).once();
        });

        it('should throw an error when resetToken is expired', async () => {
            const command: ResetPasswordCommand = {
                data: {
                    newPassword: 'Password1%',
                    resetToken: faker.random.alphaNumeric(10),
                },
            };

            when(jwtService.verifyAsync(command.data.resetToken)).thenThrow(
                new TokenExpiredError('', new Date()),
            );

            await expect(handler.execute(command)).rejects.toThrowError(
                ResetTokenExpired,
            );
        });

        it('should throw an error when resetToken could not be verified', async () => {
            const command: ResetPasswordCommand = {
                data: {
                    newPassword: 'Password1%',
                    resetToken: faker.random.alphaNumeric(10),
                },
            };

            when(jwtService.verifyAsync(command.data.resetToken)).thenThrow(
                new Error(),
            );

            await expect(handler.execute(command)).rejects.toThrowError(
                ResetTokenInvalid,
            );
        });

        it('should throw an error when resetToken is not linked to a user', async () => {
            const command: ResetPasswordCommand = {
                data: {
                    newPassword: 'Password1%',
                    resetToken: faker.random.alphaNumeric(10),
                },
            };

            when(userRepository.findOne(anything())).thenResolve(null);
            when(jwtService.verifyAsync(command.data.resetToken)).thenResolve(
                null,
            );
            when(jwtService.decode(command.data.resetToken)).thenReturn(null);

            await expect(handler.execute(command)).rejects.toThrowError(
                ResetTokenInvalid,
            );
        });

        it('should throw an error when resetToken is linked to another user', async () => {
            const command: ResetPasswordCommand = {
                data: {
                    newPassword: 'Password1%',
                    resetToken: faker.random.alphaNumeric(10),
                },
            };
            const user = createTestUser({
                resetToken: command.data.resetToken,
            });

            when(userRepository.findOne(anything())).thenResolve({
                ...user,
                email: 'email1@test.com',
            });
            when(jwtService.verifyAsync(command.data.resetToken)).thenResolve(
                null,
            );
            when(jwtService.decode(command.data.resetToken)).thenReturn({
                email: 'email2@test.com',
            });

            await expect(handler.execute(command)).rejects.toThrowError(
                ResetTokenInvalid,
            );
        });

        it('should throw an error when the user is inactive', async () => {
            const command: ResetPasswordCommand = {
                data: {
                    newPassword: 'Password1%',
                    resetToken: faker.random.alphaNumeric(10),
                },
            };
            const user = createTestUser({
                resetToken: command.data.resetToken,
                state: UserState.Inactive,
            });

            when(userRepository.findOne(anything())).thenResolve(user);
            when(jwtService.verifyAsync(command.data.resetToken)).thenResolve(
                null,
            );
            when(jwtService.decode(command.data.resetToken)).thenReturn({
                email: user.email,
            });

            await expect(handler.execute(command)).rejects.toThrowError(
                UserStateNotAllowed,
            );
        });
    });
});
