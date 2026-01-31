import { BaseEntity } from "src/common/entities/base.entity";
import { UserRoles } from "src/common/enums/user-roles.enum";
import { Column, Entity } from "typeorm";

@Entity({ name: 'users' })
export class User extends BaseEntity {

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true, name: 'full_name' })
    fullName: string;

    @Column({ type: 'enum', enum: UserRoles })
    role: UserRoles;
}