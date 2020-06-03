import { mock, instance, reset, anything, when } from 'ts-mockito';
import { Test } from '@nestjs/testing';

import { SessionSerializer } from './session-serializer.middleware';
import { AuthenticationQueries } from './authentication.queries';
import { createTestUserSession } from '../_util/create-user-session.helper';

describe('SessionSerializer', () => {
    const authQueries = mock(AuthenticationQueries);
    let serializer: SessionSerializer;

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                SessionSerializer,
                {
                    provide: AuthenticationQueries,
                    useValue: instance(authQueries),
                },
            ],
        }).compile();

        serializer = module.get(SessionSerializer);
    });

    afterEach(() => {
        reset(authQueries);
    });

    it('should deserialize into a session from the cookie', async () => {
        const session = createTestUserSession();
        when(authQueries.composeUserSession(anything())).thenResolve(session);

        const mockNext = jest.fn();
        const req = {
            session: {
                userId: '1234',
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
        const req = {
            session: {},
            user: undefined,
        };

        await serializer.use(req, {} as any, mockNext);

        expect(mockNext).toHaveBeenCalled();
        // Verifying that it did not mutate in the serializer
        expect(req.user).toBeUndefined();
    });
});
