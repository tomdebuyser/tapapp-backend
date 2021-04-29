import { MigrationInterface, QueryRunner } from 'typeorm';

export class Silvernext1590332049092 implements MigrationInterface {
    name = 'Silvernext1590332049092';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        await queryRunner.query(
            `CREATE TYPE "user_state_enum" AS ENUM('REGISTERING', 'ACTIVE', 'INACTIVE')`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdBy" character varying, "updatedBy" character varying, "email" character varying NOT NULL, "state" "user_state_enum" NOT NULL DEFAULT 'REGISTERING', "firstName" character varying, "lastName" character varying, "password" character varying, "resetToken" character varying, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
            undefined,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP EXTENSION "uuid-ossp";`);

        await queryRunner.query(
            `DROP INDEX "IDX_4be2f7adf862634f5f803d246b"`,
            undefined,
        );
        await queryRunner.query(
            `DROP INDEX "IDX_5f9286e6c25594c6b88c108db7"`,
            undefined,
        );
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`DROP TYPE "user_state_enum"`, undefined);
    }
}
