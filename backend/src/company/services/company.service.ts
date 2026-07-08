import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from '../dto/create-company.dto';
import { UpdateCompanyDto } from '../dto/update-company.dto';
import { CreateCompanyWithOfficesDto } from '../dto/create-company-with-offices.dto';
import { Company } from '../entities/company.entity';
import { Office } from '../entities/office.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class CompanyService {

  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
    @InjectRepository(Office) private officeRepository: Repository<Office>,
    private readonly dataSource: DataSource,
  ) {}

  public async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = new Company();
    company.name = createCompanyDto.name;
    if (createCompanyDto.address) company.address = createCompanyDto.address;
    return await this.companyRepository.save(company);
  }

  public async createWithOffices(dto: CreateCompanyWithOfficesDto): Promise<Company> {
    const names = dto.offices.map(o => o.name.toLowerCase());
    const unique = new Set(names);
    if (unique.size !== names.length) {
      throw new BadRequestException('Office names must be unique within a company');
    }

    return await this.dataSource.transaction(async manager => {
      const company = manager.create(Company, { name: dto.name, address: dto.address });
      const savedCompany = await manager.save(Company, company);

      const offices = dto.offices.map(o =>
        manager.create(Office, {
          name: o.name,
          location: o.location,
          officeSurcharge: o.officeSurcharge,
          addressSurcharge: o.addressSurcharge,
          pricePerKg: o.pricePerKg,
          companyId: savedCompany.id,
        }),
      );
      savedCompany.offices = await manager.save(Office, offices);
      return savedCompany;
    });
  }

  public async findAll(): Promise<Company[]> {
    return this.companyRepository.find({ relations: ['offices'], order: { name: 'ASC' } });
  }

  public async findOne(id: number): Promise<Company | null> {
    return await this.companyRepository.findOne({ where: { id }, relations: ['offices'] });
  }

  public async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<Company | null> {
    const company = await this.findOne(id);
    if (company) {
      Object.assign(company, updateCompanyDto);
      return await this.companyRepository.save(company);
    }
    return null;
  }

  public async softDelete(id: number): Promise<boolean> {
    const company = await this.companyRepository.findOne({
      where: { id },
      relations: ['offices'],
    });
    if (!company) throw new NotFoundException(`Company ${id} not found`);

    // Soft-delete all offices first, then the company
    if (company.offices?.length) {
      await this.officeRepository.softDelete(company.offices.map(o => o.id));
    }
    const result = await this.companyRepository.softDelete(id);
    return result.affected! > 0;
  }
}
