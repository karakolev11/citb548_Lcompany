import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCompanyAddressAndOfficeFk1770100000000 implements MigrationInterface {
    name = 'AddCompanyAddressAndOfficeFk1770100000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "address" varchar`);
        await queryRunner.query(`ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "company_id" integer`);
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.table_constraints
                    WHERE constraint_name = 'fk_offices_company'
                ) THEN
                    ALTER TABLE "offices"
                    ADD CONSTRAINT "fk_offices_company"
                    FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE;
                END IF;
            END $$
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "offices" DROP CONSTRAINT IF EXISTS "fk_offices_company"`);
        await queryRunner.query(`ALTER TABLE "offices" DROP COLUMN IF EXISTS "company_id"`);
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN IF EXISTS "address"`);
    }
}
