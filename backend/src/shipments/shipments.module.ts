import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { Shipment } from './entities/shipment.entity';
import { Customer } from 'src/users/entities/customer.entity';
import { Employee } from 'src/users/entities/employee.entity';
import { Office } from 'src/company/entities/office.entity';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';

@Module({
  controllers: [ShipmentsController],
  providers: [ShipmentsService, AuthGuard, RoleGuard],
  imports: [TypeOrmModule.forFeature([Shipment, Customer, Office, Employee])],
})
export class ShipmentsModule {}
