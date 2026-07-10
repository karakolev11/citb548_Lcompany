import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { EmployeeType } from '../enums/employee-type.enum';

export class CreateEmployeeWithUserDto {
    @IsString()
    @MinLength(3)
    username!: string;

    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(8)
    password!: string;

    @IsString()
    @IsNotEmpty()
    firstName!: string;

    @IsString()
    @IsNotEmpty()
    lastName!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    department?: string;

    @IsOptional()
    @IsString()
    jobTitle?: string;

    @IsOptional()
    @IsString()
    employeeId?: string;

    @IsEnum(EmployeeType)
    employeeType!: EmployeeType;

    @IsInt()
    officeId!: number;
}
