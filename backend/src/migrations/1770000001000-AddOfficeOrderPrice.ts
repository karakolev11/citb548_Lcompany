import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOfficeOrderPrice1770000001000 implements MigrationInterface {
  name = 'AddOfficeOrderPrice1770000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add order_price only if neither it nor its renamed form office_surcharge exists yet
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='offices' AND column_name='order_price')
        AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='offices' AND column_name='office_surcharge')
        THEN
          ALTER TABLE "offices" ADD "order_price" numeric NOT NULL DEFAULT 0;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "offices" DROP COLUMN IF EXISTS "order_price"`);
  }
}
