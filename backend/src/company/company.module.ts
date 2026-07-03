import { Module } from '@nestjs/common';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Office } from './entities/office.entity';
import { OfficeService } from './services/office.service';
import { OfficeController } from './controllers/office.controller';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';

@Module({
  controllers: [CompanyController, OfficeController],
  providers: [CompanyService, OfficeService, AuthGuard, RoleGuard],
  imports: [TypeOrmModule.forFeature([Company, Office])],
  exports: [CompanyService],
})
export class CompanyModule {}
