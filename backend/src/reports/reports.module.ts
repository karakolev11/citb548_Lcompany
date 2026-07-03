import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { Shipment } from 'src/shipments/entities/shipment.entity';
import { Office } from 'src/company/entities/office.entity';
import { Company } from 'src/company/entities/company.entity';
import { Customer } from 'src/users/entities/customer.entity';
import { Employee } from 'src/users/entities/employee.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Office, Company, Customer, Employee])],
  controllers: [ReportsController],
  providers: [ReportsService, AuthGuard, RoleGuard],
})
export class ReportsModule {}
