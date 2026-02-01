import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateShipments1769904902159 implements MigrationInterface {
    name = 'CreateShipments1769904902159'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42c4897c8f7"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_8eeae315efd4e9aa2be981e158b"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_0415d9f25fbf1142252f48a0d63"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_f27302e988a894ef975b020db79"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_a1b3ef25aba5fc2dc40c9641b00"`);
        await queryRunner.query(`
            CREATE TABLE "shipments" (
                "id" SERIAL NOT NULL, 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP WITH TIME ZONE, 
                "senderId" integer, 
                "receiverId" integer, 
                "officeId" integer, 
                "weight" numeric NOT NULL, 
                "deliveredAddress" character varying, 
                "deliveredCity" character varying, 
                "deliveredZip" character varying, 
                "deliveredCountry" character varying, 
                "sender_id" integer, 
                "receiver_id" integer, 
                "office_id" integer, 
                CONSTRAINT "PK_6deda4532ac542a93eab214b564" PRIMARY KEY ("id")
            )`
        );
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "employeeId"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "role_id" integer`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "employee_id" character varying`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "user_id" integer`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "UQ_2d83c53c3e553a48dadb9722e38" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "company_id" integer`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "user_id" integer`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "UQ_11d81cd7be87b6f8865b0cf7661" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "company_id" integer`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "roleId" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "REL_9da8e46e5b19e0aee62a5c0b4f"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "REL_c7bc1ffb56c570e39a13449715"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_2d83c53c3e553a48dadb9722e38" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_7f3eeef59eece4147effe7bfa6a" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_11d81cd7be87b6f8865b0cf7661" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_f0e29920aaf871f3eddbea69f0d" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_e2b989dd89274f77ff534862b30" FOREIGN KEY ("sender_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_e585f3dd4bb096286f9d59d815f" FOREIGN KEY ("receiver_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "shipments" ADD CONSTRAINT "FK_94ecc3d91a77221dcd47d235c66" FOREIGN KEY ("office_id") REFERENCES "offices"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_94ecc3d91a77221dcd47d235c66"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_e585f3dd4bb096286f9d59d815f"`);
        await queryRunner.query(`ALTER TABLE "shipments" DROP CONSTRAINT "FK_e2b989dd89274f77ff534862b30"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_f0e29920aaf871f3eddbea69f0d"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_11d81cd7be87b6f8865b0cf7661"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_7f3eeef59eece4147effe7bfa6a"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_2d83c53c3e553a48dadb9722e38"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a2cecd1a3531c0b041e29ba46e1"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "REL_c7bc1ffb56c570e39a13449715" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "REL_9da8e46e5b19e0aee62a5c0b4f" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "roleId" SET DEFAULT '3'`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "company_id"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "UQ_11d81cd7be87b6f8865b0cf7661"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "company_id"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "UQ_2d83c53c3e553a48dadb9722e38"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP COLUMN "employee_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "employees" ADD "employeeId" character varying`);
        await queryRunner.query(`DROP TABLE "shipments"`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_a1b3ef25aba5fc2dc40c9641b00" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_f27302e988a894ef975b020db79" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_0415d9f25fbf1142252f48a0d63" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_8eeae315efd4e9aa2be981e158b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42c4897c8f7" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION`);
    }

}
