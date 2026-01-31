import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { Company } from "src/company/entities/company.entity";

@Entity({ name: 'customers' })
export class Customer extends BaseEntity {

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true })
    city?: string;

    @Column({ nullable: true })
    state?: string;

    @Column({ nullable: true })
    zipCode?: string;

    @Column({ nullable: true })
    country?: string;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    userId: number;

    @ManyToOne(() => Company, company => company.customers, { nullable: true })
    @JoinColumn({ name: 'company_id' })
    company?: Company;

    @Column({ nullable: true })
    companyId?: number;
}
