import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmployeeOfficeFk1770200000000 implements MigrationInterface {
    name = 'AddEmployeeOfficeFk1770200000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "office_id" integer`);
        await queryRunner.query(`
            UPDATE "employees" e
            SET "office_id" = o."id"
            FROM "offices" o
            WHERE e."companyId" = COALESCE(o."company_id", o."companyId")
              AND e."office_id" IS NULL
              AND o."deleted_at" IS NULL
        `);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'fk_employees_office'
                ) THEN
                    ALTER TABLE "employees"
                    ADD CONSTRAINT "fk_employees_office"
                    FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE RESTRICT;
                END IF;
            END $$
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT IF EXISTS "fk_employees_office"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN IF EXISTS "office_id"`);
    }
}
