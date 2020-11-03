import { getCustomRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, instance, when, anything, reset, capture } from 'ts-mockito';
import * as faker from 'faker';
import * as bcrypt from 'bcrypt';

import { LoggerService } from '@libs/logger';
import { UserRepository } from '@libs/models';
import { createTestUser } from '@libs/testing';
import { InvalidOldPassword } from '../authentication.errors';
import { ChangePasswordRequest } from '../dto';
import { ChangePasswordHandler } from './change-password.command';

describe('ChangePasswordHandler', () => {
    let module: TestingModule;
    let handler: ChangePasswordHandler;

    const userRepository = mock(UserRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                ChangePasswordHandler,
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

        handler = module.get(ChangePasswordHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
    });

    describe('execute', () => {
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

            await handler.execute(request, faker.random.uuid());

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
                handler.execute(request, faker.random.uuid()),
            ).rejects.toThrowError(InvalidOldPassword);
        });
    });
});
