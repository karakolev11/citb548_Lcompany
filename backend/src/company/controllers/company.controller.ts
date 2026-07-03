import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CreateCompanyWithOfficesDto } from '../dto/create-company-with-offices.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/common/enums/user-roles.enum';

@Controller('company')
@UseGuards(AuthGuard, RoleGuard)
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Roles(UserRoles.ADMIN)
  public async create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.create(createCompanyDto);
  }

  @Post('with-offices')
  @Roles(UserRoles.ADMIN)
  public async createWithOffices(@Body() dto: CreateCompanyWithOfficesDto) {
    return this.companyService.createWithOffices(dto);
  }

  @Get()
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  public async findAll() {
    return this.companyService.findAll();
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  public async findOne(@Param('id') id: string) {
    return this.companyService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN)
  public async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.update(+id, updateCompanyDto);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  public async softDelete(@Param('id') id: string) {
    return this.companyService.softDelete(+id);
  }
}
