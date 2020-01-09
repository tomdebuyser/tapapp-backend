import { Test } from '@nestjs/testing';

import { RolesQueries } from './roles.queries';
import { DatabaseModule, RoleRepository } from '../database';
import { GetRolesRequestQuery, RolesSortColumns } from './dto';
import { SortDirection } from '../_shared/constants';

describe('RolesQueries', () => {
    let roleRepository: RoleRepository;
    let rolesQueries: RolesQueries;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [DatabaseModule],
            providers: [RolesQueries],
        }).compile();

        rolesQueries = module.get(RolesQueries);
        roleRepository = module.get(RoleRepository);
    });

    afterAll(() => {
        roleRepository.manager.connection.close();
    });

    describe('getRoles', () => {
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
                const result = await rolesQueries.getRoles(query);
                expect(result).toMatchSnapshot();
            });
        });

        it('should return an empty list if no roles found', async () => {
            const result = await rolesQueries.getRoles({
                search: 'nonsensicaljibberish',
            });
            expect(result).toMatchSnapshot();
        });
    });
});
