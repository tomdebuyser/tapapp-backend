import { EntityManager } from 'typeorm';

export function loadFixtures(
    dbConnection: EntityManager,
    data: unknown[],
    entityName: string,
): Promise<unknown> {
    return dbConnection
        .createQueryBuilder()
        .insert()
        .into(entityName)
        .values(data)
        .execute();
}

export function deleteFixtures(
    dbConnection: EntityManager,
    data: unknown[],
    entityName: string,
): Promise<unknown> {
    return dbConnection
        .createQueryBuilder()
        .delete()
        .from(entityName)
        .where(data)
        .execute();
}
