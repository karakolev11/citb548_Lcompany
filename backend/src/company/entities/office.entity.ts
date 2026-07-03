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

    @Column({ type: 'numeric', name: 'order_price', default: 0 })
    orderPrice!: number;

    @Column({ nullable: true })
    companyId?: number;

    @ManyToOne(() => Company, company => company.offices, { onDelete: 'CASCADE' })
    company!: Company;
}    