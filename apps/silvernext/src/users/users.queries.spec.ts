import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';

import { DatabaseModule, UserRepository } from '@libs/database';
import { UsersQueries } from './users.queries';
import { GetUsersRequestQuery, UsersSortColumns } from './dto';
import { SortDirection } from '../shared/constants';
import { Config } from '../config';

describe('UsersQueries', () => {
    let module: TestingModule;
    let userRepository: UserRepository;
    let usersQueries: UsersQueries;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [DatabaseModule.registerTest(Config.database)],
            providers: [UsersQueries],
        }).compile();

        usersQueries = module.get(UsersQueries);
        userRepository = module.get(UserRepository);
    });

    afterAll(async () => {
        await userRepository.manager.connection.close();
        await module.close();
    });

    describe('getUser', () => {
        it('should return the requested user correctly', async () => {
            const result = await usersQueries.getUser(
                'c4cb4582-1e97-4e3e-9d49-c744c8c1a229',
            );
            expect(result).toMatchSnapshot();
        });

        it('should return nothing if the requested user does not exist', async () => {
            const result = await usersQueries.getUser(faker.random.uuid());
            expect(result).toMatchSnapshot();
        });
    });

    describe('getUsers', () => {
        const testQueries: GetUsersRequestQuery[] = [
            {},
            { skip: 2, take: 2 },
            { search: 'user1' },
            { search: 'DEVELOPMENT' },
            { search: 'Tom' },
            {
                sortBy: UsersSortColumns.CreatedAt,
                sortDirection: SortDirection.Ascending,
            },
        ];

        testQueries.forEach((query, index) => {
            it(`should return a paged list of users: #${index}`, async () => {
                const result = await usersQueries.getUsers(query);
                expect(result).toMatchSnapshot();
            });
        });

        it('should return an empty list if no users found', async () => {
            const result = await usersQueries.getUsers({
                search: 'nonsensicaljibberish',
            });
            expect(result).toMatchSnapshot();
        });
    });
});
