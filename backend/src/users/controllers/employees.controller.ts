import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EmployeeService } from '../services/employee.service';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { UpdateEmployeeDto, UpdateEmployeeWithUserDto } from '../dto/update-employee.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { CreateEmployeeWithUserDto } from '../dto/create-employee-with-user.dto';

@Controller('employees')
@UseGuards(AuthGuard, RoleGuard)
export class EmployeesController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @Roles(UserRoles.ADMIN)
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  @Post('with-user')
  @Roles(UserRoles.ADMIN)
  createWithUser(@Body() payload: CreateEmployeeWithUserDto) {
    return this.employeeService.createWithUser(payload);
  }

  @Get()
  @Roles(UserRoles.ADMIN)
  findAll() {
    return this.employeeService.findAll();
  }

  @Get('user/:userId')
  @Roles(UserRoles.ADMIN)
  findByUserId(@Param('userId') userId: string) {
    return this.employeeService.findByUserId(+userId);
  }

  @Get('company/:companyId')
  @Roles(UserRoles.ADMIN)
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.employeeService.findByCompanyId(+companyId);
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN)
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN)
  update(@Param('id') id: string, @Body() updateEmployeeDto: UpdateEmployeeWithUserDto) {
    const { username, email, ...employeeUpdate } = updateEmployeeDto;
    return this.employeeService.updateWithUser(+id, employeeUpdate, { username, email });
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  remove(@Param('id') id: string) {
    return this.employeeService.softDelete(+id);
  }
}
