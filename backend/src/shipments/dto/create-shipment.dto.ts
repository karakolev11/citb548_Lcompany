export class CreateShipmentDto {
	senderId?: number;
	receiverId?: number;
	officeId?: number;
	weight: number;
	deliveredAddress?: string;
	deliveredCity?: string;
	deliveredState?: string;
	deliveredZip?: string;
	deliveredCountry?: string;
}
