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

import { UserRepository, UserState } from '@libs/models';
import { MailerService } from '@libs/mailer';
import { LoggerService } from '@libs/logger';
import { createTestUser } from '@libs/testing';
import { createTestUserSession } from '../../shared/testing';
import { RegisterMailService } from './register-mail.service';

describe('RegisterMailService', () => {
    let module: TestingModule;
    let registerMailService: RegisterMailService;

    const userRepository = mock(UserRepository);
    const jwtService = mock(JwtService);
    const mailerService = mock(MailerService);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                RegisterMailService,
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

        registerMailService = module.get(RegisterMailService);

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
    });

    describe('sendMail', () => {
        it('should send the register email correctly', async () => {
            const user = createTestUser({ state: UserState.Registering });
            const resetToken = faker.random.alphaNumeric(10);
            const session = createTestUserSession();

            when(userRepository.findOne(anything())).thenResolve(user);
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );
            when(userRepository.update(anything(), anything())).thenCall(
                user => ({
                    ...user,
                    id: faker.random.uuid(),
                }),
            );

            await registerMailService.sendMail(user, session);

            verify(
                userRepository.update(
                    user.id,
                    objectContaining({
                        resetToken,
                        state: UserState.Registering,
                        updatedBy: session.email,
                    }),
                ),
            ).once();
        });
    });
});
