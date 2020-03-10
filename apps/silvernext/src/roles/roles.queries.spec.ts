import { Test } from '@nestjs/testing';
import * as faker from 'faker';

import { DatabaseModule, RoleRepository } from '@libs/database';
import { RolesQueries } from './roles.queries';
import { GetRolesRequestQuery, RolesSortColumns } from './dto';
import { SortDirection } from '../_shared/constants';
import { Config } from '../config';

describe('RolesQueries', () => {
    let roleRepository: RoleRepository;
    let rolesQueries: RolesQueries;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [DatabaseModule.register(Config.database)],
            providers: [RolesQueries],
        }).compile();

        rolesQueries = module.get(RolesQueries);
        roleRepository = module.get(RoleRepository);
    });

    afterAll(() => {
        roleRepository.manager.connection.close();
    });

    describe('getRole', () => {
        it('should return the requested role correctly', async () => {
            const result = await rolesQueries.getRole(
                '0c1510ab-5dca-41e2-8912-ee165140ae90',
            );
            expect(result).toMatchSnapshot();
        });

        it('should return nothing if the requested role does not exist', async () => {
            const result = await rolesQueries.getRole(faker.random.uuid());
            expect(result).toMatchSnapshot();
        });
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
