import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { Shipment } from './entities/shipment.entity';
import { Customer } from 'src/users/entities/customer.entity';
import { Office } from 'src/company/entities/office.entity';

@Module({
  controllers: [ShipmentsController],
  providers: [ShipmentsService],
  imports: [TypeOrmModule.forFeature([Shipment, Customer, Office])],
})
export class ShipmentsModule {}
