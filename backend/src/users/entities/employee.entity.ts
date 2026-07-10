import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Company } from "src/company/entities/company.entity";
import { Office } from "src/company/entities/office.entity";
import { EmployeeType } from "src/users/enums/employee-type.enum";

@Entity({ name: 'employees' })
export class Employee extends BaseEntity {

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    department?: string;

    @Column({ nullable: true })
    jobTitle?: string;

    @Column({ nullable: true, name: 'employee_id' })
    employeeId?: string;

    @Column({ type: 'enum', enum: EmployeeType, name: 'employee_type', default: EmployeeType.OFFICE_STAFF })
    employeeType!: EmployeeType;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ name: 'user_id' })
    userId!: number;

    @ManyToOne(() => Company, company => company.employees)
    @JoinColumn({ name: 'company_id' })
    company!: Company;

    @Column({ name: 'company_id' })
    companyId!: number;

    @ManyToOne(() => Office)
    @JoinColumn({ name: 'office_id' })
    office!: Office;

    @Column({ nullable: true, name: 'office_id' })
    officeId?: number;
}
