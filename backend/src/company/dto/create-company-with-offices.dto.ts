import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOfficeInlineDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  location!: string;

  @IsNumber()
  @Min(0)
  officeSurcharge!: number;

  @IsNumber()
  @Min(0)
  addressSurcharge!: number;

  @IsNumber()
  @Min(0)
  pricePerKg!: number;
}

export class CreateCompanyWithOfficesDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @Length(5, 200)
  address!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOfficeInlineDto)
  offices!: CreateOfficeInlineDto[];
}
