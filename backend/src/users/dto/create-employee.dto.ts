import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

    @IsInt()
    userId!: number;

    @IsInt()
    companyId!: number;
}
