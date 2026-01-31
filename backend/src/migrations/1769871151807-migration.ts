import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1769871151807 implements MigrationInterface {
    name = 'Migration1769871151807'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create roles table
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" SERIAL NOT NULL, 
                "name" character varying NOT NULL, 
                "description" character varying, 
                CONSTRAINT "UQ_648e3f5447f725270a4edca2278" UNIQUE ("name"), 
                CONSTRAINT "PK_c1433d71a4236f8926c1435255b" PRIMARY KEY ("id")
            )`
        );
        
        // Insert default roles
        await queryRunner.query(`
            INSERT INTO "roles" ("name", "description") 
            VALUES ('ADMIN', 'Administrator role')`
        );
        await queryRunner.query(`
            INSERT INTO "roles" ("name", "description") 
            VALUES ('EMPLOYEE', 'Employee role')`
        );
        await queryRunner.query(`
            INSERT INTO "roles" ("name", "description") 
            VALUES ('CUSTOMER', 'Customer role')`
        );
        
        // Create companies table
        await queryRunner.query(`
            CREATE TABLE "companies" (
                "id" SERIAL NOT NULL, 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP WITH TIME ZONE, 
                "name" character varying NOT NULL, 
                CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id")
            )`
        );
        
        // Create offices table
        await queryRunner.query(`
            CREATE TABLE "offices" (
                "id" SERIAL NOT NULL, 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP WITH TIME ZONE, 
                "name" character varying NOT NULL, 
                "location" character varying NOT NULL, 
                "companyId" integer, 
                CONSTRAINT "PK_1ea41502c6dddcec44ad9fcbbb3" PRIMARY KEY ("id")
            )`
        );
        
        // Create users table with role_id foreign key
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" SERIAL NOT NULL, 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP WITH TIME ZONE, 
                "username" character varying NOT NULL, 
                "password" character varying NOT NULL, 
                "email" character varying NOT NULL, 
                "roleId" integer NOT NULL DEFAULT '3', 
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), 
                CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), 
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )`
        );
        
        // Create customers table
        await queryRunner.query(`
            CREATE TABLE "customers" (
                "id" SERIAL NOT NULL, 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP WITH TIME ZONE, 
                "firstName" character varying NOT NULL, 
                "lastName" character varying NOT NULL, 
                "phone" character varying, 
                "address" character varying, 
                "city" character varying, 
                "state" character varying, 
                "zipCode" character varying, 
                "country" character varying, 
                "userId" integer NOT NULL, 
                "companyId" integer, 
                CONSTRAINT "REL_c7bc1ffb56c570e39a13449715" UNIQUE ("userId"), 
                CONSTRAINT "PK_133ec679a801fab5f6910db9d74" PRIMARY KEY ("id")
            )`
        );
        
        // Create employees table
        await queryRunner.query(`
            CREATE TABLE "employees" (
                "id" SERIAL NOT NULL, 
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), 
                "deleted_at" TIMESTAMP WITH TIME ZONE, 
                "firstName" character varying NOT NULL, 
                "lastName" character varying NOT NULL, 
                "phone" character varying, 
                "department" character varying, 
                "jobTitle" character varying, 
                "employeeId" character varying, 
                "userId" integer NOT NULL, 
                "companyId" integer NOT NULL, 
                CONSTRAINT "REL_9da8e46e5b19e0aee62a5c0b4f" UNIQUE ("userId"), 
                CONSTRAINT "PK_b9535cdf6f7071c221fa99b11ef" PRIMARY KEY ("id")
            )`
        );
        
        // Add foreign keys
        await queryRunner.query(`ALTER TABLE "offices" ADD CONSTRAINT "FK_c9dbbefcfcc0cc2c94289ac2d4b" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_368e146b785b574f42c4897c8f7" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_f27302e988a894ef975b020db79" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "customers" ADD CONSTRAINT "FK_a1b3ef25aba5fc2dc40c9641b00" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_8eeae315efd4e9aa2be981e158b" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_0415d9f25fbf1142252f48a0d63" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_0415d9f25fbf1142252f48a0d63"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_8eeae315efd4e9aa2be981e158b"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_a1b3ef25aba5fc2dc40c9641b00"`);
        await queryRunner.query(`ALTER TABLE "customers" DROP CONSTRAINT "FK_f27302e988a894ef975b020db79"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_368e146b785b574f42c4897c8f7"`);
        await queryRunner.query(`ALTER TABLE "offices" DROP CONSTRAINT "FK_c9dbbefcfcc0cc2c94289ac2d4b"`);
        
        // Drop tables
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "offices"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP TABLE "roles"`);
    }

}
