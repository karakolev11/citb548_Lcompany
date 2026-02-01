import { Module } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Office } from './entities/office.entity';
import { OfficeService } from './services/office.service';
import { OfficeController } from './controllers/office.controller';

@Module({
  controllers: [CompanyController, OfficeController],
  providers: [CompanyService, OfficeService],
  imports: [TypeOrmModule.forFeature([Company, Office])],
  exports: [CompanyService],
})
export class CompanyModule {}
