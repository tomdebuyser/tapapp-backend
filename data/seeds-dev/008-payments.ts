import { readFileSync } from 'fs';
import { MigrationInterface, QueryRunner } from 'typeorm';

import { loadFixtures, deleteFixtures } from '../util/run-seeds';

const entityName = 'Payment';
const path = `${__dirname}/payments.json`;
const data = JSON.parse(readFileSync(path).toString());

export class PaymentsSeeds1578312827195 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        // await loadFixtures(queryRunner.manager, data, entityName);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        // await deleteFixtures(queryRunner.manager, data, entityName);
    }
}
