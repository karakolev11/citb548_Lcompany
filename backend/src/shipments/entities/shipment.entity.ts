import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Customer } from "src/users/entities/customer.entity";
import { Office } from "src/company/entities/office.entity";

@Entity({ name: 'shipments' })
export class Shipment extends BaseEntity {

	@ManyToOne(() => Customer, { nullable: true })
	@JoinColumn({ name: 'sender_id' })
	sender?: Customer;

	@Column({ nullable: true })
	senderId?: number;

	@ManyToOne(() => Customer, { nullable: true })
	@JoinColumn({ name: 'receiver_id' })
	receiver?: Customer;

	@Column({ nullable: true })
	receiverId?: number;

	@ManyToOne(() => Office, { nullable: true })
	@JoinColumn({ name: 'office_id' })
	office?: Office;

	@Column({ nullable: true })
	officeId?: number;

	@Column({ type: 'numeric' })
	weight: number;

	@Column({ nullable: true })
	deliveredAddress?: string;

	@Column({ nullable: true })
	deliveredCity?: string;

	@Column({ nullable: true })
	deliveredZip?: string;

	@Column({ nullable: true })
	deliveredCountry?: string;
}
