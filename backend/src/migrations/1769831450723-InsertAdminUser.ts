import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertAdminUser1769831450723 implements MigrationInterface {
    
    name='InsertAdminUser1769831450723';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO users (username, password, email, full_name, role)
            VALUES ('admin', 'admin', 'admin@mail.com', 'Admin User', 'ADMIN')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM users WHERE username = 'admin'`);
    }

}
