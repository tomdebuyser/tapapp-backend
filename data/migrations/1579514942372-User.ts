import {MigrationInterface, QueryRunner} from "typeorm";

export class User1579514942372 implements MigrationInterface {
    name = 'User1579514942372'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "createdBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "role" ADD "createdBy" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "updatedBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "role" ADD "updatedBy" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdBy" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedBy" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "updatedBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "role" ADD "updatedBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "createdBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "role" ADD "createdBy" uuid`, undefined);
    }

}
