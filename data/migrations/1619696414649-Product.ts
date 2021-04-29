import { MigrationInterface, QueryRunner } from 'typeorm';

export class Product1619696414649 implements MigrationInterface {
    name = 'Product1619696414649';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedBy" character varying, "name" character varying NOT NULL, "logo" character varying NOT NULL, "price" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "predecessorId" character varying, "organisationId" uuid, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "product" ADD CONSTRAINT "FK_d905575f248a8d670b7f96abef4" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "product" DROP CONSTRAINT "FK_d905575f248a8d670b7f96abef4"`,
        );
        await queryRunner.query(`DROP TABLE "product"`);
    }
}
