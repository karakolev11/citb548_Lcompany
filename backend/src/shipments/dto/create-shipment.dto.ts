import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { ShipmentStatus } from '../enums/shipment-status.enum';

export class CreateShipmentDto {
	@IsOptional()
	@IsNumber()
	senderId?: number;

	@IsOptional()
	@IsNumber()
	receiverId?: number;

	@IsOptional()
	@IsNumber()
	officeId?: number;

	@IsNumber()
	@IsPositive()
	weight: number;

	@IsOptional()
	@IsEnum(ShipmentStatus)
	status?: ShipmentStatus;

	@IsOptional()
	@IsString()
	description?: string;

	@IsOptional()
	@IsDateString()
	estimatedDeliveryDate?: string;

	@IsOptional()
	@IsNumber()
	orderPriceSnapshot?: number;

	@IsOptional()
	@IsString()
	deliveredAddress?: string;

	@IsOptional()
	@IsString()
	deliveredCity?: string;

	@IsOptional()
	@IsString()
	deliveredState?: string;

	@IsOptional()
	@IsString()
	deliveredZip?: string;

	@IsOptional()
	@IsString()
	deliveredCountry?: string;
}
