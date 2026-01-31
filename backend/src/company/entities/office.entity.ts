import { BaseEntity } from "src/common/entities/base.entity";
import { Column, ManyToOne } from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Company } from "./company.entity";

@Entity({ name: 'offices' })
export class Office extends BaseEntity {

    @Column()
    name: string;

    @Column()
    location: string;

    @ManyToOne(() => Company, company => company.offices)
    company: Company;
}    