import { UserType } from '@libs/models';

export enum SortDirection {
    Ascending = 'ASC',
    Descending = 'DESC',
}

export type UserSession = {
    userId: string;
    type: UserType;
    isActive: boolean;
    email: string;
    name: string;
    organisation: {
        id: string;
        isActive: boolean;
    };
};
