import { anything, instance, mock, reset, when } from 'ts-mockito';
import * as faker from 'faker';
import { Test, TestingModule } from '@nestjs/testing';
import { getCustomRepositoryToken } from '@nestjs/typeorm';

import { SessionSerializer } from './session-serializer.middleware';
import { createTestUserSession } from '../../shared/testing';
import { UserRepository, UserState } from '@libs/models';
import { createTestUser } from '@libs/testing';

describe('SessionSerializer', () => {
    let module: TestingModule;
    let serializer: SessionSerializer;

    const userRepository = mock(UserRepository);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                SessionSerializer,
                {
                    provide: getCustomRepositoryToken(UserRepository),
                    useValue: instance(userRepository),
                },
            ],
        }).compile();

        serializer = module.get(SessionSerializer);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(userRepository);
    });

    it('should deserialize into a session from the cookie', async () => {
        const user = createTestUser({
            state: UserState.Active,
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
        });
        const session = createTestUserSession(user);
        when(userRepository.findOne(anything())).thenResolve(user);

        const mockNext = jest.fn();
        const req: any = {
            session: {
                userId: user.id,
            },
            // Defining here to avoid type errors below
            user: undefined,
        };

        await serializer.use(req, {} as any, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(req.user).toEqual(session);
    });

    it('should continue if no cookie is present', async () => {
        const mockNext = jest.fn();
        const req: any = {
            session: {},
            user: undefined,
        };

        await serializer.use(req, {} as any, mockNext);

        expect(mockNext).toHaveBeenCalled();
        // Verifying that it did not mutate in the serializer
        expect(req.user).toBeUndefined();
    });
});
