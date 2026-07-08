import { IsInt, IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateOfficeDto {
  @IsString()
  name: string;

  @IsString()
  location: string;

  @IsNumber()
  @IsPositive()
  orderPrice: number;

  @IsInt()
  @IsPositive()
  companyId: number;
}
