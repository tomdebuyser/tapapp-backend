import { SelectQueryBuilder } from 'typeorm';

export class QueryBuilderMock<T> {
    constructor(private readonly response: T) {}

    static instance<T>(response: T): SelectQueryBuilder<T> {
        // eslint-disable-next-line
        // @ts-ignore - needed here so we not have to implement all SelectQueryBuilder methods...
        return new QueryBuilderMock<T>(response) as SelectQueryBuilder<T>;
    }

    select(): QueryBuilderMock<T> {
        return this;
    }

    innerJoin(): QueryBuilderMock<T> {
        return this;
    }

    leftJoin(): QueryBuilderMock<T> {
        return this;
    }

    innerJoinAndSelect(): QueryBuilderMock<T> {
        return this;
    }

    where(): QueryBuilderMock<T> {
        return this;
    }

    andWhere(): QueryBuilderMock<T> {
        return this;
    }

    async getMany(): Promise<T> {
        return this.response;
    }

    async getOne(): Promise<T> {
        return this.response;
    }
}
