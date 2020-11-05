import { Test, TestingModule } from '@nestjs/testing';

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
            const userId = 'c4cb4582-1e97-4e3e-9d49-c744c8c1a229';
            const result = await handler.execute({ data: { userId } });
            expect(result).toMatchSnapshot();
        });

        it('should return no user if not found', async () => {
            const userId = '63440b0f-59b3-473e-bf87-2c05136cc005';
            const result = await handler.execute({ data: { userId } });
            expect(result).toMatchSnapshot();
        });
    });
});
