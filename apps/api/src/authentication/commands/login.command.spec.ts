import { getCustomRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, instance, when, anything, reset } from 'ts-mockito';
import * as faker from 'faker';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

import { LoggerService } from '@libs/logger';
import { UserRepository } from '@libs/models';
import { createTestUser } from '@libs/testing';
import { UserNotActive } from '../authentication.errors';
import { LoginHandler } from './login.command';

describe('LoginHandler', () => {
    let module: TestingModule;
    let handler: LoginHandler;

    const userRepository = mock(UserRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                LoginHandler,
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

        handler = module.get(LoginHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
    });

    describe('login', () => {
        it('should validate the login credentials correctly', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = createTestUser({ email, password: hashedPassword });

            when(userRepository.findOne(anything())).thenResolve(user);

            expect(
                await handler.execute({
                    data: { username: email, password },
                }),
            ).toBeTruthy();
        });

        it('should throw an error when the linked user is not found', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            when(userRepository.findOne(anything())).thenResolve(null);

            await expect(
                handler.execute({
                    data: { username: email, password },
                }),
            ).rejects.toThrowError(UnauthorizedException);
        });

        it('should throw an error when the user is not active', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const user = createTestUser({
                email,
                password,
                isActive: false,
            });

            when(userRepository.findOne(anything())).thenResolve(user);

            await expect(
                handler.execute({
                    data: { username: email, password },
                }),
            ).rejects.toThrowError(UserNotActive);
        });

        it('should throw an error when the passwords do not match', async () => {
            const email = faker.internet.email();
            const password = 'Password1%';
            const hashedPassword = await bcrypt.hash(`_${password}`, 10);
            const user = createTestUser({ email, password: hashedPassword });

            when(userRepository.findOne(anything())).thenResolve(user);

            await expect(
                handler.execute({
                    data: { username: email, password },
                }),
            ).rejects.toThrowError(UnauthorizedException);
        });
    });
});
