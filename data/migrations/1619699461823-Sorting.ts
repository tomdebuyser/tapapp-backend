import { MigrationInterface, QueryRunner } from 'typeorm';

export class Sorting1619699461823 implements MigrationInterface {
    name = 'Sorting1619699461823';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "category_sorting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organisationId" uuid, "categoryIds" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_ef0e69df097018ec2eb390ecf25" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "category_sorting" ADD CONSTRAINT "FK_642763a1acbc9672d38429ea62b" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `CREATE TABLE "product_sorting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "organisationId" uuid, "categoryId" uuid, "productIds" jsonb NOT NULL DEFAULT '[]', CONSTRAINT "PK_220a87bdee9805504ab08324b13" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "product_sorting" ADD CONSTRAINT "FK_642763a1acbc9672d38429ea62c" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "product_sorting" ADD CONSTRAINT "FK_642763a1acbc9672d38429ea62d" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "product_sorting" DROP CONSTRAINT "FK_642763a1acbc9672d38429ea62d"`,
        );
        await queryRunner.query(
            `ALTER TABLE "product_sorting" DROP CONSTRAINT "FK_642763a1acbc9672d38429ea62c"`,
        );
        await queryRunner.query(`DROP TABLE "product_sorting"`);
        await queryRunner.query(
            `ALTER TABLE "category_sorting" DROP CONSTRAINT "FK_642763a1acbc9672d38429ea62b"`,
        );
        await queryRunner.query(`DROP TABLE "category_sorting"`);
    }
}
