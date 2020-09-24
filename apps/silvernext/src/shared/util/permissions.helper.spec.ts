import { hasPermissions } from './permissions.helper';

describe('Permissions helpers', () => {
    describe('hasPermissions', () => {
        it('should return false when arguments type dont match', () => {
            expect(hasPermissions(true, { read: true })).toBe(false);
            expect(hasPermissions({ create: false }, false)).toBe(false);
        });

        it('should return false when permissions are required, but none are passed', () => {
            expect(hasPermissions(null, { edit: true })).toBe(false);
            expect(hasPermissions(undefined, { edit: true })).toBe(false);
        });

        it('should return true when executed without required permissions', () => {
            expect(hasPermissions({ delete: true }, null)).toBe(true);
        });

        for (const {
            requiredPermissions,
            permissions,
            expected,
        } of getCases()) {
            it('should successfully compare permissions', () => {
                expect(hasPermissions(permissions, requiredPermissions)).toBe(
                    expected,
                );
            });
        }
    });
});

function getCases(): Array<{
    requiredPermissions: object;
    permissions: object;
    expected: boolean;
}> {
    return [
        {
            permissions: {
                user: {
                    edit: false,
                    delete: true,
                },
                sessions: {
                    delete: true,
                    edit: true,
                },
            },
            requiredPermissions: {
                user: {
                    edit: false,
                    delete: true,
                },
            },
            expected: true,
        },
        {
            permissions: {
                user: {
                    edit: false,
                    delete: true,
                },
                sessions: {
                    delete: true,
                    edit: true,
                },
            },
            requiredPermissions: {
                user: {
                    edit: true,
                    delete: true,
                },
            },
            expected: false,
        },
    ];
}
