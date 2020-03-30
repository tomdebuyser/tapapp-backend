import { Test } from '@nestjs/testing';
import { mock, when, instance, reset, anything } from 'ts-mockito';
import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';

import { LoggerService } from '@libs/logger';
import { UserState } from '@libs/database';
import {
    RequiredUserStateGuard,
    UserStateNotAllowed,
} from './required-user-state.guard';

describe('RequiredUserStateGuard', () => {
    let guard: RequiredUserStateGuard;
    const context = mock<ExecutionContext>();
    const argumentsHost = mock<HttpArgumentsHost>();
    const reflector = mock(Reflector);

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            providers: [
                { provide: Reflector, useValue: instance(reflector) },
                {
                    provide: LoggerService,
                    useValue: instance(mock(LoggerService)),
                },
                RequiredUserStateGuard,
            ],
        }).compile();

        guard = module.get(RequiredUserStateGuard);
    });

    afterEach(() => {
        reset(context);
        reset(argumentsHost);
        reset(reflector);
    });

    it('should allow valid states to continue', () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest<any>()).thenReturn({
            user: {
                state: UserState.Active,
            },
        });
        when(reflector.get<UserState[]>(anything(), anything())).thenReturn([
            UserState.Active,
            UserState.Registering,
        ]);

        const hasRightState = guard.canActivate(instance(context));
        expect(hasRightState).toBe(true);
    });

    it('should throw an error when a user is not in a required state', () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest<any>()).thenReturn({
            user: {
                state: UserState.Inactive,
            },
        });
        when(reflector.get<UserState[]>(anything(), anything())).thenReturn([
            UserState.Active,
        ]);

        expect(() => guard.canActivate(instance(context))).toThrowError(
            UserStateNotAllowed,
        );
    });
});
