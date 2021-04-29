import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';

import { ModelsModule, UserRepository } from '@libs/models';
import { Config } from '../../config';
import { GetAuthenticatedUserHandler } from './get-authenticated-user.query';

describe('GetAuthenticatedUserHandler', () => {
    let module: TestingModule;
    let userRepository: UserRepository;
    let handler: GetAuthenticatedUserHandler;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [ModelsModule.registerTest(Config.models)],
            providers: [GetAuthenticatedUserHandler],
        }).compile();

        handler = module.get(GetAuthenticatedUserHandler);
        userRepository = module.get(UserRepository);
    });

    afterAll(async () => {
        await userRepository.manager.connection.close();
        await module.close();
    });

    describe('execute', () => {
        it(`should return the correct user`, async () => {
            const result = await handler.execute({
                data: { userId: '49affd08-f461-4e80-899f-7612e971ff12' },
            });
            expect(result).toMatchSnapshot();
        });

        it('should return no user if not found', async () => {
            const result = await handler.execute({
                data: { userId: faker.datatype.uuid() },
            });
            expect(result).toMatchSnapshot();
        });
    });
});
