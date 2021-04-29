import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sorting1619699461823 implements MigrationInterface {
    name = 'Sorting1619699461823';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "category_sorting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organisationId" character varying NOT NULL, "categoryIds" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_ef0e69df097018ec2eb390ecf25" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "product_sorting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organisationId" character varying NOT NULL, "categoryId" character varying NOT NULL, "productIds" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_220a87bdee9805504ab08324b13" PRIMARY KEY ("id"))`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product_sorting"`);
        await queryRunner.query(`DROP TABLE "category_sorting"`);
    }
}
