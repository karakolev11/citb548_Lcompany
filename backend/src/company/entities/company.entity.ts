import { BaseEntity } from "src/common/entities/base.entity";
import { OneToMany } from "typeorm";
import { Column } from "typeorm/decorator/columns/Column";
import { Entity } from "typeorm/decorator/entity/Entity";
import { Office } from "./office.entity";
import { Customer } from "src/users/entities/customer.entity";
import { Employee } from "src/users/entities/employee.entity";

@Entity({ name: 'companies' })   
export class Company extends BaseEntity {

    @Column()
    name: string;

    @OneToMany(() => Office, office => office.company)
    offices: Office[];

    @OneToMany(() => Customer, customer => customer.company)
    customers: Customer[];

    @OneToMany(() => Employee, employee => employee.company)
    employees: Employee[];
    
}
