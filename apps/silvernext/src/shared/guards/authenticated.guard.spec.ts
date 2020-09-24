import { Test, TestingModule } from '@nestjs/testing';
import { mock, when, instance, reset } from 'ts-mockito';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';

import { UserState } from '@libs/database';
import { AuthenticatedGuard } from './authenticated.guard';

describe('AuthenticationGuard', () => {
    let module: TestingModule;
    let guard: AuthenticatedGuard;
    const context = mock<ExecutionContext>();
    const argumentsHost = mock<HttpArgumentsHost>();

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [AuthenticatedGuard],
        }).compile();

        guard = module.get(AuthenticatedGuard);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(context);
        reset(argumentsHost);
    });

    it('should authenticate incoming requests', async () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest<any>()).thenReturn({
            isAuthenticated: () => true,
            user: {
                state: UserState.Active,
            },
        });

        const isAuthenticated = await guard.canActivate(instance(context));

        expect(isAuthenticated).toBe(true);
    });

    it('should destroy session and throw error when not authenticated', async () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest<any>()).thenReturn({
            isAuthenticated: () => false,
            logout: () => null,
            session: {
                destroy: (cb: Function): void => cb(),
            },
        });
        when(argumentsHost.getResponse<any>()).thenReturn({
            clearCookie: (_cookieName: string) => null,
        });

        await expect(guard.canActivate(instance(context))).rejects.toThrowError(
            UnauthorizedException,
        );
    });

    it('should destroy session and throw error when not in ACTIVE state', async () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest<any>()).thenReturn({
            isAuthenticated: () => false,
            logout: () => null,
            user: {
                state: UserState.Inactive,
            },
            session: {
                destroy: (cb: Function): void => cb(),
            },
        });
        when(argumentsHost.getResponse<any>()).thenReturn({
            clearCookie: (_cookieName: string) => null,
        });

        await expect(guard.canActivate(instance(context))).rejects.toThrowError(
            UnauthorizedException,
        );
    });
});
