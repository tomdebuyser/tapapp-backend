import { Test, TestingModule } from '@nestjs/testing';
import { mock, when, instance, reset, anything } from 'ts-mockito';
import { ExecutionContext } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { Reflector } from '@nestjs/core';
import { DeepPartial } from 'typeorm';

import { LoggerService } from '@libs/logger';
import { Permissions } from '@libs/models';
import {
    RequiredPermissionsGuard,
    PermissionDenied,
} from './required-permissions.guard';

describe('RequiredPermissionsGuard', () => {
    let module: TestingModule;
    let guard: RequiredPermissionsGuard;
    const context = mock<ExecutionContext>();
    const argumentsHost = mock<HttpArgumentsHost>();
    const reflector = mock(Reflector);

    beforeAll(async () => {
        module = await Test.createTestingModule({
            providers: [
                { provide: Reflector, useValue: instance(reflector) },
                {
                    provide: LoggerService,
                    useValue: instance(mock(LoggerService)),
                },
                RequiredPermissionsGuard,
            ],
        }).compile();

        guard = module.get(RequiredPermissionsGuard);
    });

    afterAll(async () => {
        await module.close();
    });

    afterEach(() => {
        reset(context);
        reset(argumentsHost);
        reset(reflector);
    });

    it('should allow when given the right permissions', () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest<any>()).thenReturn({
            user: {
                permissions: {
                    roles: {
                        view: true,
                        edit: true,
                    },
                },
            },
        });
        when(
            reflector.get<DeepPartial<Permissions>>(anything(), anything()),
        ).thenReturn({
            roles: { edit: true },
        });

        const hasPermission = guard.canActivate(instance(context));
        expect(hasPermission).toBe(true);
    });

    it('should throw an error when given invalid permissions', () => {
        when(context.switchToHttp()).thenReturn(instance(argumentsHost));
        when(argumentsHost.getRequest<any>()).thenReturn({
            user: {
                permissions: {
                    users: {
                        view: false,
                        edit: false,
                    },
                },
            },
        });
        when(
            reflector.get<DeepPartial<Permissions>>(anything(), anything()),
        ).thenReturn({
            users: {
                edit: true,
            },
        });

        expect(() => guard.canActivate(instance(context))).toThrowError(
            PermissionDenied,
        );
    });
});
