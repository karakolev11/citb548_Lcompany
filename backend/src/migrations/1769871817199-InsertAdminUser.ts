import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertAdminUser1769871817199 implements MigrationInterface {
    
    name = 'InsertAdminUser1769871817199';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "users" ("username", "password", "email", "roleId") 
            VALUES ('admin', 'admin', 'admin@mail.com', 1)`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "users" 
            WHERE "username" = 'admin'`
        );
    }

}
