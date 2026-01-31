import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';

@Injectable()
export class CompanyService {

  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>
  ) {}
  
  public async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = new Company();
    company.name = createCompanyDto.name;
    return await this.companyRepository.save(company);
  }

  public async findAll(): Promise<Company[]> {
    return this.companyRepository.find();
  }

  public async findOne(id: number): Promise<Company | null> {
    return await this.companyRepository.findOneBy({ id });
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
    const result = await this.companyRepository.softDelete(id);
    return result.affected! > 0;
  }
}
