import { MigrationInterface, QueryRunner } from 'typeorm';

export class NormalizeUserCustomerEmployeeFkColumns1770000000000 implements MigrationInterface {
  name = 'NormalizeUserCustomerEmployeeFkColumns1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'userId'
        ) THEN
          EXECUTE 'UPDATE "employees" SET "user_id" = COALESCE("user_id", "userId")';
          EXECUTE 'ALTER TABLE "employees" DROP COLUMN "userId"';
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'companyId'
        ) THEN
          EXECUTE 'UPDATE "employees" SET "company_id" = COALESCE("company_id", "companyId")';
          EXECUTE 'ALTER TABLE "employees" DROP COLUMN "companyId"';
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'officeId'
        ) THEN
          EXECUTE 'UPDATE "employees" SET "office_id" = COALESCE("office_id", "officeId")';
          EXECUTE 'ALTER TABLE "employees" DROP COLUMN "officeId"';
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'userId'
        ) THEN
          EXECUTE 'UPDATE "customers" SET "user_id" = COALESCE("user_id", "userId")';
          EXECUTE 'ALTER TABLE "customers" DROP COLUMN "userId"';
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'companyId'
        ) THEN
          EXECUTE 'UPDATE "customers" SET "company_id" = COALESCE("company_id", "companyId")';
          EXECUTE 'ALTER TABLE "customers" DROP COLUMN "companyId"';
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "userId" integer;
      ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "companyId" integer;
      ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "officeId" integer;
      UPDATE "employees" SET "userId" = "user_id" WHERE "userId" IS NULL;
      UPDATE "employees" SET "companyId" = "company_id" WHERE "companyId" IS NULL;
      UPDATE "employees" SET "officeId" = "office_id" WHERE "officeId" IS NULL;

      ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "userId" integer;
      ALTER TABLE "customers" ADD COLUMN IF NOT EXISTS "companyId" integer;
      UPDATE "customers" SET "userId" = "user_id" WHERE "userId" IS NULL;
      UPDATE "customers" SET "companyId" = "company_id" WHERE "companyId" IS NULL;
    `);
  }
}
