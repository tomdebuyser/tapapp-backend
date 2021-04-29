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
import * as faker from 'faker';

import { RoleRepository, UserRepository, User } from '@libs/models';
import { LoggerService } from '@libs/logger';
import { RoleNotFound, RoleInUse } from '../roles.errors';
import {
    createTestRole,
    createTestUser,
    QueryBuilderMock,
} from '@libs/testing';
import { DeleteRoleHandler } from './delete-role.command';

describe('DeleteRoleHandler', () => {
    let module: TestingModule;
    let handler: DeleteRoleHandler;

    const roleRepository = mock(RoleRepository);
    const userRepository = mock(UserRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                DeleteRoleHandler,
                {
                    provide: LoggerService,
                    useValue: instance(mock(LoggerService)),
                },
                {
                    provide: getCustomRepositoryToken(RoleRepository),
                    useValue: instance(roleRepository),
                },
                {
                    provide: getCustomRepositoryToken(UserRepository),
                    useValue: instance(userRepository),
                },
            ],
        }).compile();

        handler = module.get(DeleteRoleHandler);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(roleRepository);
        reset(userRepository);
    });

    describe('execute', () => {
        it('should delete the role correctly', async () => {
            const role = createTestRole({ id: faker.random.uuid() });

            when(roleRepository.findOne(anything())).thenResolve(role);
            when(userRepository.createQueryBuilder(anything())).thenReturn(
                QueryBuilderMock.instance<User>(null),
            );

            await handler.execute({ data: { roleId: role.id } });

            verify(
                roleRepository.delete(
                    objectContaining({
                        id: role.id,
                    }),
                ),
            ).once();
        });

        it('should throw an error when the role does not exist', async () => {
            when(roleRepository.findOne(anything())).thenResolve(null);

            await expect(
                handler.execute({ data: { roleId: faker.random.uuid() } }),
            ).rejects.toThrowError(RoleNotFound);
        });

        it('should throw an error when the role is still in use', async () => {
            const role = createTestRole({ id: faker.random.uuid() });

            when(roleRepository.findOne(anything())).thenResolve(role);
            when(userRepository.createQueryBuilder(anything())).thenReturn(
                QueryBuilderMock.instance<User>(createTestUser()),
            );

            await expect(
                handler.execute({ data: { roleId: faker.random.uuid() } }),
            ).rejects.toThrowError(RoleInUse);
        });
    });
});
