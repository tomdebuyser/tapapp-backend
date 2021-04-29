import { MigrationInterface, QueryRunner } from 'typeorm';

export class Silvernext1590332049092 implements MigrationInterface {
    name = 'Silvernext1590332049092';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

        await queryRunner.query(
            `CREATE TYPE "user_type_enum" AS ENUM('SUPER_ADMIN', 'ADMIN', 'USER')`,
        );
        await queryRunner.query(
            `CREATE TABLE "user" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), 
                "createdBy" character varying,
                "updatedBy" character varying, 
                "email" character varying NOT NULL,
                "type" "user_type_enum" NOT NULL DEFAULT 'USER',
                "isActive" boolean NOT NULL DEFAULT true,
                "name" character varying NOT NULL, 
                "password" character varying NOT NULL,
                CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
                CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
            )`,
            undefined,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP EXTENSION "uuid-ossp";`);

        await queryRunner.query(`DROP TABLE "user"`, undefined);
    }
}
