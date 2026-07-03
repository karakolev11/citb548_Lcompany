import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from "bcrypt";

export class InsertAdminUser1769871817199 implements MigrationInterface {
    
    name = 'InsertAdminUser1769871817199';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hashedPassword = await bcrypt.hash('adminadmin', 10);
        await queryRunner.query(`
            INSERT INTO "users" ("username", "password", "email", "roleId") 
            VALUES ('admin', $1, 'admin@mail.com', 1)`, [hashedPassword]
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE FROM "users" 
            WHERE "username" = 'admin'`
        );
    }

}
