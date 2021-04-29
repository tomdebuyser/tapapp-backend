import { MigrationInterface, QueryRunner } from 'typeorm';

export class Organisation1619692170294 implements MigrationInterface {
    name = 'Organisation1619692170294';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "organisation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedBy" character varying, "name" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_d9428f9c8e3052d6617e3aab0ed" UNIQUE ("name"), CONSTRAINT "PK_c725ae234ef1b74cce43d2d00c1" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(`ALTER TABLE "user" ADD "organisationId" uuid`);
        await queryRunner.query(
            `ALTER TABLE "user" ADD CONSTRAINT "FK_642763a1acbc9672d38429ea62a" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user" DROP CONSTRAINT "FK_642763a1acbc9672d38429ea62a"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user" DROP COLUMN "organisationId"`,
        );
        await queryRunner.query(`DROP TABLE "organisation"`);
    }
}
