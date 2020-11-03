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

import { LoggerService } from '@libs/logger';
import { UserRepository } from '@libs/models';
import { MailerService } from '@libs/mailer';
import { createTestUser } from '@libs/testing';
import { RequestPasswordResetRequest } from '../dto';
import { RequestPasswordResetHandler } from './request-password-reset.command';

describe('RequestPasswordResetHandler', () => {
    let module: TestingModule;
    let handler: RequestPasswordResetHandler;

    const userRepository = mock(UserRepository);
    const jwtService = mock(JwtService);
    const mailerService = mock(MailerService);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                RequestPasswordResetHandler,
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

        handler = module.get(RequestPasswordResetHandler);

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

    describe('execute', () => {
        it('should handle the request for password reset correctly', async () => {
            const request: RequestPasswordResetRequest = {
                email: faker.internet.email(),
            };
            const user = createTestUser({ email: request.email });
            const resetToken = faker.random.alphaNumeric(10);

            when(userRepository.findOne(anything())).thenResolve(user);
            when(jwtService.signAsync(anything(), anything())).thenResolve(
                resetToken,
            );

            await handler.execute(request);

            verify(
                userRepository.update(
                    user.id,
                    objectContaining({
                        updatedBy: request.email,
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

            await handler.execute(request);

            verify(userRepository.update(anything(), anything())).never();
        });
    });
});
