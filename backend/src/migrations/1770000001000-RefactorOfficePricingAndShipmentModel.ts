import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorOfficePricingAndShipmentModel1770000001000 implements MigrationInterface {
  name = 'RefactorOfficePricingAndShipmentModel1770000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Offices ──────────────────────────────────────────────────────────────
    // Rename order_price → office_surcharge if it still exists
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='offices' AND column_name='order_price') THEN
          ALTER TABLE "offices" RENAME COLUMN "order_price" TO "office_surcharge";
        END IF;
      END $$;
    `);
    // Add address_surcharge
    await queryRunner.query(`
      ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "address_surcharge" numeric NOT NULL DEFAULT 0;
    `);
    // Add price_per_kg
    await queryRunner.query(`
      ALTER TABLE "offices" ADD COLUMN IF NOT EXISTS "price_per_kg" numeric NOT NULL DEFAULT 0;
    `);

    // ── Shipments ─────────────────────────────────────────────────────────────
    // Drop old receiver FK columns
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name='FK_e585f3dd4bb096286f9d59d815f' AND table_name='shipments') THEN
          ALTER TABLE "shipments" DROP CONSTRAINT "FK_e585f3dd4bb096286f9d59d815f";
        END IF;
      END $$;
    `);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "receiverId";`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "receiver_id";`);
    // Drop old camelCase duplicate columns from initial migration
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "senderId";`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "officeId";`);

    // Add new shipment columns
    await queryRunner.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'shipments_delivery_mode_enum') THEN
          CREATE TYPE "shipments_delivery_mode_enum" AS ENUM ('office', 'address');
        END IF;
      END $$;
    `);
    await queryRunner.query(`
      ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "receiver_name" character varying;
    `);
    await queryRunner.query(`
      ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "delivery_mode" "shipments_delivery_mode_enum" NOT NULL DEFAULT 'office';
    `);
    await queryRunner.query(`
      ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "creator_id" integer;
    `);
    await queryRunner.query(`
      ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "creator_role" integer;
    `);
    // Rename orderPriceSnapshot → price_snapshot
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='shipments' AND column_name='orderPriceSnapshot') THEN
          ALTER TABLE "shipments" RENAME COLUMN "orderPriceSnapshot" TO "price_snapshot";
        ELSIF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='shipments' AND column_name='price_snapshot') THEN
          ALTER TABLE "shipments" ADD COLUMN "price_snapshot" numeric;
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "price_snapshot";`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "creator_role";`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "creator_id";`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "delivery_mode";`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN IF EXISTS "receiver_name";`);
    await queryRunner.query(`ALTER TABLE "offices" DROP COLUMN IF EXISTS "price_per_kg";`);
    await queryRunner.query(`ALTER TABLE "offices" DROP COLUMN IF EXISTS "address_surcharge";`);
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='offices' AND column_name='office_surcharge') THEN
          ALTER TABLE "offices" RENAME COLUMN "office_surcharge" TO "order_price";
        END IF;
      END $$;
    `);
  }
}
