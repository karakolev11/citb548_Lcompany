import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOfficeOrderPrice1770000001000 implements MigrationInterface {
  name = 'AddOfficeOrderPrice1770000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offices" ADD "order_price" numeric NOT NULL DEFAULT 0`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offices" DROP COLUMN "order_price"`);
  }
}
