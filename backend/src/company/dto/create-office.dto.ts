import { IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateOfficeDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  orderPrice?: number;

  @IsOptional()
  @IsNumber()
  companyId?: number;
}
