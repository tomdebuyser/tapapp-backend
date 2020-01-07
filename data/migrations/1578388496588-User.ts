import {MigrationInterface, QueryRunner} from "typeorm";

export class User1578388496588 implements MigrationInterface {
    name = 'User1578388496588'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" ADD "firstName" character varying`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`, undefined);
    }

}
