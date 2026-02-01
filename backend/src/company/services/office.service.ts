import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Office } from '../entities/office.entity';
import { CreateOfficeDto } from '../dto/create-office.dto';
import { UpdateOfficeDto } from '../dto/update-office.dto';
import { Company } from '../entities/company.entity';

@Injectable()
export class OfficeService {
  constructor(@InjectRepository(Office) private officeRepository: Repository<Office>) {}

  public async create(createOfficeDto: CreateOfficeDto): Promise<Office> {
    const office = new Office();
    office.name = createOfficeDto.name;
    office.location = createOfficeDto.location;
    if (createOfficeDto.companyId) {
      // set company relation by id; TypeORM will accept an object with id
      // to set relation without loading the entity
      office.company = { id: createOfficeDto.companyId } as Company;
    }
    return await this.officeRepository.save(office);
  }

  public async findAll(): Promise<Office[]> {
    return await this.officeRepository.find({ relations: ['company'] });
  }

  public async findOne(id: number): Promise<Office | null> {
    return await this.officeRepository.findOne({ where: { id }, relations: ['company'] });
  }

  public async findByCompanyId(companyId: number): Promise<Office[]> {
    return await this.officeRepository.find({ where: { company: { id: companyId } }, relations: ['company'] });
  }

  public async update(id: number, updateOfficeDto: UpdateOfficeDto): Promise<Office | null> {
    const office = await this.findOne(id);
    if (!office) return null;
    Object.assign(office, updateOfficeDto);
    if ((updateOfficeDto as any).companyId) {
      (office as any).company = { id: (updateOfficeDto as any).companyId };
    }
    return await this.officeRepository.save(office);
  }

  public async softDelete(id: number): Promise<boolean> {
    const result = await this.officeRepository.softDelete(id);
    return result.affected! > 0;
  }
}
