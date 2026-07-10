import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";
import { Customer } from "src/users/entities/customer.entity";
import { Office } from "src/company/entities/office.entity";
import { ShipmentStatus } from "../enums/shipment-status.enum";
import { DeliveryMode } from "../enums/delivery-mode.enum";

@Entity({ name: 'shipments' })
export class Shipment extends BaseEntity {

	@ManyToOne(() => Customer, { nullable: true })
	@JoinColumn({ name: 'sender_id' })
	sender?: Customer;

	@Column({ nullable: true, name: 'sender_id' })
	senderId?: number;

	@ManyToOne(() => Customer, { nullable: true })
	@JoinColumn({ name: 'receiver_customer_id' })
	receiverCustomer?: Customer;

	@Column({ nullable: true, name: 'receiver_customer_id' })
	receiverCustomerId?: number;

	@Column({ nullable: true, name: 'receiver_name' })
	receiverName?: string;

	@ManyToOne(() => Office, { nullable: true })
	@JoinColumn({ name: 'office_id' })
	office?: Office;

	@Column({ nullable: true, name: 'office_id' })
	officeId?: number;

	@Column({ type: 'numeric' })
	weight!: number;

	@Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.PENDING })
	status!: ShipmentStatus;

	@Column({ unique: true })
	trackingNumber!: string;

	@Column({ nullable: true })
	description?: string;

	@Column({ type: 'enum', enum: DeliveryMode, default: DeliveryMode.OFFICE, name: 'delivery_mode' })
	deliveryMode!: DeliveryMode;

	@Column({ nullable: true, name: 'creator_id' })
	creatorId?: number;

	@Column({ nullable: true, name: 'creator_role' })
	creatorRole?: number;

	@Column({ type: 'timestamptz', nullable: true })
	estimatedDeliveryDate?: Date;

	@Column({ type: 'timestamptz', nullable: true })
	actualDeliveryDate?: Date;

	@Column({ type: 'numeric', nullable: true, name: 'price_snapshot' })
	priceSnapshot?: number;

	@Column({ nullable: true })
	deliveredAddress?: string;

	@Column({ nullable: true })
	deliveredCity?: string;

	@Column({ nullable: true })
	deliveredZip?: string;

	@Column({ nullable: true })
	deliveredCountry?: string;
}
