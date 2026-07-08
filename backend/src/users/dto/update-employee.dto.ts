import { PartialType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}

export class UpdateEmployeeWithUserDto extends UpdateEmployeeDto {
	@IsOptional()
	@IsString()
	@MinLength(3)
	username?: string;

	@IsOptional()
	@IsEmail()
	email?: string;
}
