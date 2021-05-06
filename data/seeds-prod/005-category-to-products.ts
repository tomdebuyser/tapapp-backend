import { MigrationInterface, QueryRunner } from 'typeorm';
import { readFileSync } from 'fs';

import { loadFixtures, deleteFixtures } from '../util/run-seeds';

const entityName = 'category_products_product';
const path = `${__dirname}/category-to-products.json`;
const data = JSON.parse(readFileSync(path).toString());

export class CategoryToProductsSeeds1578312827195
    implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await loadFixtures(queryRunner.manager, data, entityName);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await deleteFixtures(queryRunner.manager, data, entityName);
    }
}
