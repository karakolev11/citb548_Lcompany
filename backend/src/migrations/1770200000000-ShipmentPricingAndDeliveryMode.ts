import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShipmentPricingAndDeliveryMode1770200000001 implements MigrationInterface {
  name = 'ShipmentPricingAndDeliveryMode1770200000001';

  // All changes in this migration are already handled by
  // RefactorOfficePricingAndShipmentModel1770000001000 (which uses IF EXISTS guards).
  // This migration is intentionally a no-op to avoid conflicts.
  public async up(_queryRunner: QueryRunner): Promise<void> {}
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}

