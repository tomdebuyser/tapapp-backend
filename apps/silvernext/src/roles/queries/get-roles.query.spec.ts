import { Test, TestingModule } from '@nestjs/testing';

import { ModelsModule, RoleRepository } from '@libs/models';
import { GetRolesHandler } from './get-roles.query';
import { Config } from '../../config';
import { SortDirection } from '../../shared/constants';
import { GetRolesRequestQuery, RolesSortColumns } from '../dto';

describe('GetRolesHandler', () => {
    let module: TestingModule;
    let roleRepository: RoleRepository;
    let handler: GetRolesHandler;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [ModelsModule.registerTest(Config.models)],
            providers: [GetRolesHandler],
        }).compile();

        handler = module.get(GetRolesHandler);
        roleRepository = module.get(RoleRepository);
    });

    afterAll(async () => {
        await roleRepository.manager.connection.close();
        await module.close();
    });

    describe('execute', () => {
        const testQueries: GetRolesRequestQuery[] = [
            {},
            { skip: 2, take: 2 },
            { search: 'admin' },
            { search: 'SUPPORT' },
            {
                sortBy: RolesSortColumns.CreatedAt,
                sortDirection: SortDirection.Ascending,
            },
        ];

        testQueries.forEach((query, index) => {
            it(`should return a paged list of roles: #${index}`, async () => {
                const result = await handler.execute(query);
                expect(result).toMatchSnapshot();
            });
        });

        it('should return an empty list if no roles found', async () => {
            const result = await handler.execute({
                search: 'nonsensicaljibberish',
            });
            expect(result).toMatchSnapshot();
        });
    });
});
