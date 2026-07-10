import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShipmentReceiverCustomer1770300000000 implements MigrationInterface {
  name = 'AddShipmentReceiverCustomer1770300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shipments" ADD "receiver_customer_id" integer`);
    await queryRunner.query(
      `ALTER TABLE "shipments" ADD CONSTRAINT "FK_shipments_receiver_customer" FOREIGN KEY ("receiver_customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_shipments_receiver_customer"`);
    await queryRunner.query(`ALTER TABLE "shipments" DROP COLUMN "receiver_customer_id"`);
  }
}