import { Test, TestingModule } from '@nestjs/testing';

import { ModelsModule, UserRepository } from '@libs/models';
import { GetUsersRequestQuery, UsersSortColumns } from '../dto';
import { SortDirection } from '../../shared/constants';
import { Config } from '../../config';
import { GetUsersHandler } from './get-users.query';

describe('GetUsersHandler', () => {
    let module: TestingModule;
    let userRepository: UserRepository;
    let handler: GetUsersHandler;

    beforeAll(async () => {
        module = await Test.createTestingModule({
            imports: [ModelsModule.registerTest(Config.models)],
            providers: [GetUsersHandler],
        }).compile();

        handler = module.get(GetUsersHandler);
        userRepository = module.get(UserRepository);
    });

    afterAll(async () => {
        await userRepository.manager.connection.close();
        await module.close();
    });

    describe('execute', () => {
        const testQueries: GetUsersRequestQuery[] = [
            {},
            { skip: 2, take: 2 },
            { search: 'wltc1' },
            { search: 'WLTC2' },
            { search: 'Tom' },
            {
                sortBy: UsersSortColumns.CreatedAt,
                sortDirection: SortDirection.Ascending,
            },
        ];

        testQueries.forEach(request => {
            it(`should return a paged list of users: ${JSON.stringify(
                request,
            )}`, async () => {
                const result = await handler.execute({ data: request });
                expect(result).toMatchSnapshot();
            });
        });

        it('should return an empty list if no users found', async () => {
            const result = await handler.execute({
                data: { search: 'nonsensicaljibberish' },
            });
            expect(result).toMatchSnapshot();
        });
    });
});
