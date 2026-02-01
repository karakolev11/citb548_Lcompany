import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { EmployeesController } from './controllers/employees.controller';
import { CustomersController } from './controllers/customers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Employee } from './entities/employee.entity';
import { Customer } from './entities/customer.entity';
import { CustomerService } from './services/customer.service';
import { EmployeeService } from './services/employee.service';

@Module({
  controllers: [UsersController, EmployeesController, CustomersController],
  providers: [UsersService, CustomerService, EmployeeService],
  imports: [TypeOrmModule.forFeature([User, Employee, Customer])],
  exports: [UsersService, CustomerService, EmployeeService],
})
export class UsersModule {}
