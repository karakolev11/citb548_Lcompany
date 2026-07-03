import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomerService } from '../services/customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/common/enums/user-roles.enum';

@Controller('customers')
@UseGuards(AuthGuard, RoleGuard)
export class CustomersController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Get('user/:userId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  findByUserId(@Param('userId') userId: string) {
    return this.customerService.findByUserId(+userId);
  }

  @Get('company/:companyId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findByCompanyId(@Param('companyId') companyId: string) {
    return this.customerService.findByCompanyId(+companyId);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  remove(@Param('id') id: string) {
    return this.customerService.softDelete(+id);
  }
}
