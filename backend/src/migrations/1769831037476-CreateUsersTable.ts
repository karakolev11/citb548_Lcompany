import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersTable1769831037476 implements MigrationInterface {
    name = 'CreateUsersTable1769831037476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('ADMIN', 'EMPLOYEE', 'CUSTOMER')`);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL, 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP WITH TIME ZONE, 
                "username" character varying NOT NULL, 
                "password" character varying NOT NULL, 
                "email" character varying NOT NULL, 
                "full_name" character varying, 
                "role" "public"."users_role_enum" NOT NULL, 
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), 
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
