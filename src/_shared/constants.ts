import { Role } from '../database';

export enum UserState {
    Registering = 'REGISTERING',
    Active = 'ACTIVE',
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
    roles: Role[];
}
