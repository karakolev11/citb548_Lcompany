import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmployeeType1770300001000 implements MigrationInterface {
  name = 'AddEmployeeType1770300001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."employees_employee_type_enum" AS ENUM('courier', 'office_staff')`);
    await queryRunner.query(
      `ALTER TABLE "employees" ADD "employee_type" "public"."employees_employee_type_enum" NOT NULL DEFAULT 'office_staff'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "employee_type"`);
    await queryRunner.query(`DROP TYPE "public"."employees_employee_type_enum"`);
  }
}