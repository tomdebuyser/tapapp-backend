import { Permissions } from '../database';

export enum UserState {
    Registering = 'REGISTERING',
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
}

export enum SortDirection {
    Ascending = 'ASC',
    Descending = 'DESC',
}

export interface IUserSession {
    userId: string;
    email: string;
    state: UserState;
    firstName?: string;
    lastName?: string;
    permissions: Permissions;
}
