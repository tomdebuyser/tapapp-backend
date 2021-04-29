import { UserState } from '@libs/models';

export enum SortDirection {
    Ascending = 'ASC',
    Descending = 'DESC',
}

export type UserSession = {
    userId: string;
    email: string;
    state: UserState;
    firstName?: string;
    lastName?: string;
};
