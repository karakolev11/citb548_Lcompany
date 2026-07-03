import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { OfficeService } from '../services/office.service';
import { CreateOfficeDto } from '../dto/create-office.dto';
import { UpdateOfficeDto } from '../dto/update-office.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/common/enums/user-roles.enum';

@Controller('offices')
@UseGuards(AuthGuard, RoleGuard)
export class OfficeController {
  constructor(private readonly officeService: OfficeService) {}

  @Post()
  @Roles(UserRoles.ADMIN)
  create(@Body() createOfficeDto: CreateOfficeDto) {
    return this.officeService.create(createOfficeDto);
  }

  @Get()
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findAll() {
    return this.officeService.findAll();
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.officeService.findOne(+id);
  }

  @Get('company/:companyId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.officeService.findByCompanyId(+companyId);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN)
  update(@Param('id') id: string, @Body() updateOfficeDto: UpdateOfficeDto) {
    return this.officeService.update(+id, updateOfficeDto);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  remove(@Param('id') id: string) {
    return this.officeService.softDelete(+id);
  }
}
