import {MigrationInterface, QueryRunner} from "typeorm";

export class User1579182184400 implements MigrationInterface {
    name = 'User1579182184400'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "role" ADD "createdBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "role" ADD "updatedBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdBy" uuid`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedBy" uuid`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "updatedBy"`, undefined);
        await queryRunner.query(`ALTER TABLE "role" DROP COLUMN "createdBy"`, undefined);
    }

}
