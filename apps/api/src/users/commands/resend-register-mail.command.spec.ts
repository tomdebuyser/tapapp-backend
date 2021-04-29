import { getCustomRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, instance, when, anything, verify, reset } from 'ts-mockito';
import * as faker from 'faker';

import { UserRepository, UserState } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { UserNotFound, AccountAlreadyActive } from '../users.errors';
import { createTestUser } from '@libs/testing';
import { createTestUserSession } from '../../shared/testing';
import { ResendRegisterMailHandler } from './resend-register-mail.command';
import { RegisterMailService } from '../services/register-mail.service';

describe('ResendRegisterMailHandler', () => {
    let module: TestingModule;
    let handler: ResendRegisterMailHandler;

    const userRepository = mock(UserRepository);
    const registerMailService = mock(RegisterMailService);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                ResendRegisterMailHandler,
                {
                    provide: LoggerService,
                    useValue: instance(mock(LoggerService)),
                },
                {
                    provide: getCustomRepositoryToken(UserRepository),
                    useValue: instance(userRepository),
                },
                {
                    provide: RegisterMailService,
                    useValue: instance(registerMailService),
                },
            ],
        }).compile();

        handler = module.get(ResendRegisterMailHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
        reset(registerMailService);
    });

    describe('execute', () => {
        it('should resend the register email correctly', async () => {
            const user = createTestUser({ state: UserState.Registering });
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);
            when(
                registerMailService.sendMail(anything(), anything()),
            ).thenResolve(null);

            await handler.execute({ data: { userId: user.id }, session });

            verify(registerMailService.sendMail(anything(), anything())).once();
        });

        it('should throw an error when the user does not exist', async () => {
            const userId = faker.random.uuid();

            when(userRepository.findOne(anything())).thenResolve(null);

            await expect(
                handler.execute({
                    data: { userId },
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(UserNotFound);
        });

        it('should throw an error when the user is already active', async () => {
            const user = createTestUser({ state: UserState.Active });

            when(userRepository.findOne(anything())).thenResolve(user);

            await expect(
                handler.execute({
                    data: { userId: user.id },
                    session: createTestUserSession(),
                }),
            ).rejects.toThrowError(AccountAlreadyActive);
        });
    });
});
