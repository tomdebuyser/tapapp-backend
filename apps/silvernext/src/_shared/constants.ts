import { Permissions, UserState } from '@libs/database';

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
