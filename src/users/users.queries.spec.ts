import { Test } from '@nestjs/testing';

import { UsersQueries } from './users.queries';
import { DatabaseModule, UserRepository } from '../database';
import { GetUsersRequestQuery, UsersSortColumns } from './dto';
import { SortDirection } from '../_shared/constants';

describe('UsersQueries', () => {
    let userRepository: UserRepository;
    let usersQueries: UsersQueries;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [DatabaseModule],
            providers: [UsersQueries],
        }).compile();

        usersQueries = module.get(UsersQueries);
        userRepository = module.get(UserRepository);
    });

    afterAll(() => {
        userRepository.manager.connection.close();
    });

    describe('getUsers', () => {
        const testQueries: GetUsersRequestQuery[] = [
            {},
            { skip: 2, take: 2 },
            { search: 'user1' },
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
