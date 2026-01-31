import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Company } from "src/company/entities/company.entity";

@Entity({ name: 'employees' })
export class Employee extends BaseEntity {

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    department?: string;

    @Column({ nullable: true })
    jobTitle?: string;

    @Column({ nullable: true, name: 'employee_id' })
    employeeId?: string;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Company, company => company.employees)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column()
    companyId: number;
}
