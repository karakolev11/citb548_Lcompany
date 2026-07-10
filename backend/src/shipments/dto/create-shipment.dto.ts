import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { DeliveryMode } from '../enums/delivery-mode.enum';

export class CreateShipmentDto {
	@IsOptional()
	@IsString()
	@IsNotEmpty()
	receiverName?: string;

	@IsOptional()
	@IsNumber()
	receiverCustomerId?: number;

	@IsEnum(DeliveryMode)
	deliveryMode: DeliveryMode;

	@IsOptional()
	@IsNumber()
	officeId?: number;

	// For employee/admin to specify sender customer
	@IsOptional()
	@IsNumber()
	senderCustomerId?: number;

	@IsNumber()
	@IsPositive()
	weight: number;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsString()
	deliveredAddress?: string;

	@IsOptional()
	@IsString()
	deliveredCity?: string;

	@IsOptional()
	@IsString()
	deliveredZip?: string;

	@IsOptional()
	@IsString()
	deliveredCountry?: string;
}
