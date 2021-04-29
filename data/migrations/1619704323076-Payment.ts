import { MigrationInterface, QueryRunner } from 'typeorm';

export class Payment1619704323076 implements MigrationInterface {
    name = 'Payment1619704323076';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "payment_type_enum" AS ENUM('CASH', 'FREE', 'PAYCONIQ')`,
        );
        await queryRunner.query(
            `CREATE TYPE "payment_status_enum" AS ENUM('CANCELLED', 'FAILED', 'PENDING', 'SUCCEEDED')`,
        );
        await queryRunner.query(
            `CREATE TABLE "payment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedBy" character varying, "amount" integer NOT NULL, "type" "payment_type_enum" NOT NULL, "status" "payment_status_enum" NOT NULL, "data" jsonb, "organisationId" uuid, "orderId" uuid, CONSTRAINT "PK_fcaec7df5adf9cac408c686b2ab" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "payment" ADD CONSTRAINT "FK_33f34093657255a8f5db4cdb25d" FOREIGN KEY ("organisationId") REFERENCES "organisation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "payment" ADD CONSTRAINT "FK_d09d285fe1645cd2f0db811e293" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "payment" DROP CONSTRAINT "FK_d09d285fe1645cd2f0db811e293"`,
        );
        await queryRunner.query(
            `ALTER TABLE "payment" DROP CONSTRAINT "FK_33f34093657255a8f5db4cdb25d"`,
        );
        await queryRunner.query(`DROP TABLE "payment"`);
        await queryRunner.query(`DROP TYPE "payment_status_enum"`);
        await queryRunner.query(`DROP TYPE "payment_type_enum"`);
    }
}
