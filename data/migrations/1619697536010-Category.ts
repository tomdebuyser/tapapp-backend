import { MigrationInterface, QueryRunner } from 'typeorm';

export class Category1619697536010 implements MigrationInterface {
    name = 'Category1619697536010';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "category" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedBy" character varying, "name" character varying NOT NULL, "organisationId" uuid, CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "category_products_product" ("categoryId" uuid NOT NULL, "productId" uuid NOT NULL, CONSTRAINT "PK_0b4e34a45516284987c6dbe91cd" PRIMARY KEY ("categoryId", "productId"))`,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_90d521137ff8c3e927187bcd27" ON "category_products_product" ("categoryId") `,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_ee240b247f9f23e5d35854c186" ON "category_products_product" ("productId") `,
        );
        await queryRunner.query(
            `ALTER TABLE "category" ADD CONSTRAINT "FK_f8a8889acd9a0cac3c0e712fa93" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "category_products_product" ADD CONSTRAINT "FK_90d521137ff8c3e927187bcd27d" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "category_products_product" ADD CONSTRAINT "FK_ee240b247f9f23e5d35854c186b" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "category_products_product" DROP CONSTRAINT "FK_ee240b247f9f23e5d35854c186b"`,
        );
        await queryRunner.query(
            `ALTER TABLE "category_products_product" DROP CONSTRAINT "FK_90d521137ff8c3e927187bcd27d"`,
        );
        await queryRunner.query(
            `ALTER TABLE "category" DROP CONSTRAINT "FK_f8a8889acd9a0cac3c0e712fa93"`,
        );
        await queryRunner.query(`DROP INDEX "IDX_ee240b247f9f23e5d35854c186"`);
        await queryRunner.query(`DROP INDEX "IDX_90d521137ff8c3e927187bcd27"`);
        await queryRunner.query(`DROP TABLE "category_products_product"`);
        await queryRunner.query(`DROP TABLE "category"`);
    }
}
