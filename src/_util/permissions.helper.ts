import { DeepPartial } from 'typeorm';
import { mergeDeepWith, isNil, mergeDeepLeft } from 'ramda';

import { Permissions, Role } from '../database';

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
export function containsPermissionsObject(
    base: object | boolean,
    requiredObject: object | boolean,
): boolean {
    if (typeof base !== typeof requiredObject) return false;
    if (typeof base === 'boolean' && typeof requiredObject === 'boolean')
        return base === requiredObject;
    if (isNil(base) && !isNil(requiredObject)) return false;
    if (!isNil(base) && isNil(requiredObject)) return true;
    return Object.keys(requiredObject).every(key =>
        containsPermissionsObject(base[key], requiredObject[key]),
    );
}

export function createDefaultPermissions(
    overrides?: DeepPartial<Permissions>,
): Permissions {
    return mergeDeepLeft(overrides, {
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
