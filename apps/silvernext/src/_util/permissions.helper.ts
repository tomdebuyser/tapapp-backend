import { DeepPartial } from 'typeorm';
import { mergeDeepWith, isNil, mergeDeepLeft } from 'ramda';

import { Permissions, Role } from '@libs/database';

export function permissionsFromRoles(roles: Role[]): DeepPartial<Permissions> {
    return (roles || []).reduce<DeepPartial<Permissions>>(
        (acc: DeepPartial<Permissions>, role: Role) =>
            mergeDeepWith(
                (a: boolean, b: boolean) => a || b,
                acc,
                role.permissions,
            ),
        {},
    );
}

/**
 * This function is used to check whether the object representing the required permissions
 * is contained (sub-object) within the user's permissions.
 * E.g. base = { users: { view: true, edit: false } } - requiredObject = { users: { view: true } } return true
 */
export function hasPermissions(
    permission: object | boolean,
    requiredPermission: object | boolean,
): boolean {
    // If this condition is false, there is likely an issue with the incoming arguments
    if (typeof permission !== typeof requiredPermission) {
        return false;
    }

    // If there are no required permissions, there is no comparison needed
    if (isNil(requiredPermission)) {
        return true;
    }

    // If there are required permissions, but none are being passed in, there is no access
    if (isNil(permission) && !isNil(requiredPermission)) {
        return false;
    }

    // Compare concrete permissions at the end of a branch in the object
    if (
        typeof permission === 'boolean' &&
        typeof requiredPermission === 'boolean'
    ) {
        return permission === requiredPermission;
    }

    // Recursively execute when not at the tip of the branch yet
    return Object.keys(requiredPermission).every(key =>
        hasPermissions(permission[key], requiredPermission[key]),
    );
}
export function createDefaultPermissions(
    overrides?: DeepPartial<Permissions>,
): Permissions {
    return mergeDeepLeft<DeepPartial<Permissions>, Permissions>(overrides, {
        users: {
            view: false,
            edit: false,
        },
        roles: {
            view: false,
            edit: false,
        },
    });
}
