import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Role } from "src/common/entities/role.entity";
import { Exclude } from "class-transformer";

@Entity({ name: 'users' })
export class User extends BaseEntity {

    @Column({ unique: true })
    username!: string;

    @Column()
    @Exclude()
    password!: string;

    @Column({ unique: true })
    email!: string;

    @Column()
    roleId!: number;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({ name: 'role_id' })
    role!: Role;

}