import { mock, instance, reset, anything, when } from 'ts-mockito';
import { Test, TestingModule } from '@nestjs/testing';

import { SessionSerializer } from './session-serializer.middleware';
import { createTestUserSession } from '../shared/testing';
import { AuthenticationQueries } from './queries/authentication.queries';

describe('SessionSerializer', () => {
    let module: TestingModule;
    let serializer: SessionSerializer;

    const authQueries = mock(AuthenticationQueries);

    beforeAll(async () => {
        module = await Test.createTestingModule({
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

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(authQueries);
    });

    it('should deserialize into a session from the cookie', async () => {
        const session = createTestUserSession();
        when(authQueries.composeUserSession(anything())).thenResolve(session);

        const mockNext = jest.fn();
        const req: any = {
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
