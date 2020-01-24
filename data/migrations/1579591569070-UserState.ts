import {MigrationInterface, QueryRunner} from "typeorm";

export class UserState1579591569070 implements MigrationInterface {
    name = 'UserState1579591569070'

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TYPE "public"."user_state_enum" RENAME TO "user_state_enum_old"`, undefined);
        await queryRunner.query(`CREATE TYPE "user_state_enum" AS ENUM('REGISTERING', 'ACTIVE', 'INACTIVE')`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "state" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "state" TYPE "user_state_enum" USING "state"::"text"::"user_state_enum"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "state" SET DEFAULT 'REGISTERING'`, undefined);
        await queryRunner.query(`DROP TYPE "user_state_enum_old"`, undefined);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TYPE "user_state_enum_old" AS ENUM('REGISTERING', 'ACTIVE')`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "state" DROP DEFAULT`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "state" TYPE "user_state_enum_old" USING "state"::"text"::"user_state_enum_old"`, undefined);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "state" SET DEFAULT 'REGISTERING'`, undefined);
        await queryRunner.query(`DROP TYPE "user_state_enum"`, undefined);
        await queryRunner.query(`ALTER TYPE "user_state_enum_old" RENAME TO  "user_state_enum"`, undefined);
    }

}
