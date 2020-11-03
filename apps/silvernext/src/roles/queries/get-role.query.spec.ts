import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';

import { ModelsModule, RoleRepository } from '@libs/models';
import { GetRoleHandler } from './get-role.query';
import { Config } from '../../config';

describe('GetRoleHandler', () => {
    let module: TestingModule;
    let roleRepository: RoleRepository;
    let handler: GetRoleHandler;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [ModelsModule.registerTest(Config.models)],
            providers: [GetRoleHandler],
        }).compile();

        handler = module.get(GetRoleHandler);
        roleRepository = module.get(RoleRepository);
    });

    afterAll(async () => {
        await roleRepository.manager.connection.close();
        await module.close();
    });

    describe('execute', () => {
        it('should return the requested role correctly', async () => {
            const result = await handler.execute(
                '0c1510ab-5dca-41e2-8912-ee165140ae90',
            );
            expect(result).toMatchSnapshot();
        });

        it('should return nothing if the requested role does not exist', async () => {
            const result = await handler.execute(faker.random.uuid());
            expect(result).toMatchSnapshot();
        });
    });
});
