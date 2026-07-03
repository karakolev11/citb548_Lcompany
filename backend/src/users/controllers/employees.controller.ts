import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/common/enums/user-roles.enum';

@Controller('employees')
@UseGuards(AuthGuard, RoleGuard)
export class EmployeesController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(UserRoles.ADMIN)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Get()
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findAll() {
    return this.employeeService.findAll();
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id);
  }

  @Get('user/:userId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findByUserId(@Param('userId') userId: string) {
    return this.employeeService.findByUserId(+userId);
  }

  @Get('company/:companyId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.employeeService.findByCompanyId(+companyId);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeDto) {
    return this.employeeService.update(+id, updateEmployeeDto);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  remove(@Param('id') id: string) {
    return this.employeeService.softDelete(+id);
  }
}
