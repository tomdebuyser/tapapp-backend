export enum SortDirection {
    Ascending = 'ASC',
    Descending = 'DESC',
}

export type UserSession = {
    userId: string;
    email: string;
    isActive: boolean;
    name: string;
};
