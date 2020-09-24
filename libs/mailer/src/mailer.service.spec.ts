import { Test, TestingModule } from '@nestjs/testing';
import { mock, instance, when, anything, spy, capture } from 'ts-mockito';
import * as faker from 'faker';
import { Mandrill } from 'mandrill-api';

import { MailerService } from './mailer.service';
import { LoggerService } from '@libs/logger';
import { mockMailerConfig, mockMandrill } from './mailer.mocks';
import { MailerConfig } from './mailer.config';
import { createTestUser } from '@libs/testing';

describe('MailerService', () => {
    let module: TestingModule;
    let mailerService: MailerService;
    const messages = spy(mockMandrill.messages as any);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                {
                    provide: LoggerService,
                    useValue: instance(mock(LoggerService)),
                },
                {
                    useValue: mockMailerConfig,
                    provide: MailerConfig,
                },
                {
                    provide: Mandrill,
                    useValue: mockMandrill,
                },
                MailerService,
            ],
        }).compile();

        mailerService = module.get(MailerService);
    });

    afterAll(async () => {
        await module.close();
    });

    describe('sendRegisterMail', () => {
        it('should correctly call the Mandrill API', async () => {
            const user = createTestUser();
            const sender = faker.internet.email();
            const resetToken = faker.random.uuid();

            when(
                messages.send(anything(), anything(), anything()),
            ).thenCall((_, onSuccess) => onSuccess());

            await mailerService.sendRegisterMail(user, sender, resetToken);

            const [payload] = capture<any>(messages.send).last();
            expect(payload.message.subject).toBeDefined();
            expect(payload.message.html.includes(resetToken)).toBe(true);
            expect(payload.message.html.includes(sender)).toBe(true);
            expect(payload.message.text.includes(resetToken)).toBe(true);
            expect(payload.message.to).toContainEqual({ email: user.email });
        });
    });

    describe('sendRequestPasswordResetMail', () => {
        it('should correctly call the Mandrill API', async () => {
            const user = createTestUser();
            const resetToken = faker.random.uuid();

            when(
                messages.send(anything(), anything(), anything()),
            ).thenCall((_, onSuccess) => onSuccess());

            await mailerService.sendRequestPasswordResetMail(user, resetToken);

            const [payload] = capture<any>(messages.send).last();
            expect(payload.message.subject).toBeDefined();
            expect(payload.message.html.includes(resetToken)).toBe(true);
            expect(payload.message.text.includes(resetToken)).toBe(true);
            expect(payload.message.to).toContainEqual({ email: user.email });
        });
    });
});
