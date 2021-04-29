import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';

import { ModelsModule, UserRepository } from '@libs/models';
import { Config } from '../../config';
import { GetUserHandler } from './get-user.query';

describe('GetUserHandler', () => {
    let module: TestingModule;
    let userRepository: UserRepository;
    let handler: GetUserHandler;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [ModelsModule.registerTest(Config.models)],
            providers: [GetUserHandler],
        }).compile();

        handler = module.get(GetUserHandler);
        userRepository = module.get(UserRepository);
    });

    afterAll(async () => {
        await userRepository.manager.connection.close();
        await module.close();
    });

    describe('execute', () => {
        it('should return the requested user correctly', async () => {
            const result = await handler.execute({
                data: { userId: 'c4cb4582-1e97-4e3e-9d49-c744c8c1a229' },
            });
            expect(result).toMatchSnapshot();
        });

        it('should return nothing if the requested user does not exist', async () => {
            const result = await handler.execute({
                data: { userId: faker.datatype.uuid() },
            });
            expect(result).toMatchSnapshot();
        });
    });
});
