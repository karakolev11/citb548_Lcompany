import { BaseEntity } from "src/common/entities/base.entity";
import { Column, ManyToOne } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Company } from "./company.entity";

@Entity({ name: 'offices' })
export class Office extends BaseEntity {

    @Column()
    name!: string;

    @Column()
    location!: string;

    @Column({ type: 'numeric', name: 'office_surcharge', default: 0 })
    officeSurcharge!: number;

    @Column({ type: 'numeric', name: 'address_surcharge', default: 0 })
    addressSurcharge!: number;

    @Column({ type: 'numeric', name: 'price_per_kg', default: 0 })
    pricePerKg!: number;

    @Column({ nullable: true })
    companyId?: number;

    @ManyToOne(() => Company, company => company.offices, { onDelete: 'CASCADE' })
    company!: Company;
}    