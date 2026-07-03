import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShipmentLifecycleFields1770000000000 implements MigrationInterface {
  name = 'AddShipmentLifecycleFields1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."shipments_status_enum" AS ENUM('PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED')`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD "status" "public"."shipments_status_enum" NOT NULL DEFAULT 'PENDING'`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD "trackingNumber" character varying`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD "description" character varying`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD "estimatedDeliveryDate" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD "actualDeliveryDate" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD "orderPriceSnapshot" numeric`);

    await queryRunner.query(`
      UPDATE "shipments"
      SET "trackingNumber" = CONCAT('TRK-BACKFILL-', "id")
      WHERE "trackingNumber" IS NULL
    `);

    await queryRunner.query(`ALTER TABLE "shipments" ALTER COLUMN "trackingNumber" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "UQ_shipments_tracking_number" UNIQUE ("trackingNumber")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "UQ_shipments_tracking_number"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN "orderPriceSnapshot"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN "actualDeliveryDate"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN "estimatedDeliveryDate"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN "trackingNumber"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."shipments_status_enum"`);
  }
}
