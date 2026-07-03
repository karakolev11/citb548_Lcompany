import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    @Length(5, 200)
    address?: string;
}
