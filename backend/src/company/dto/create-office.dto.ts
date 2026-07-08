import { IsInt, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreateOfficeDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsNumber()
  @Min(0)
  officeSurcharge: number;

  @IsNumber()
  @Min(0)
  addressSurcharge: number;

  @IsNumber()
  @Min(0)
  pricePerKg: number;

  @IsInt()
  @IsPositive()
  companyId: number;
}
