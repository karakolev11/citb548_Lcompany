import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { EmployeeType } from '../enums/employee-type.enum';

export class CreateEmployeeDto {
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
    userId!: number;

    @IsInt()
    officeId!: number;
}
