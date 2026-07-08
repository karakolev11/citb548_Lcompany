import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Office } from '../entities/office.entity';
import { CreateOfficeDto } from '../dto/create-office.dto';
import { UpdateOfficeDto } from '../dto/update-office.dto';
import { Company } from '../entities/company.entity';

@Injectable()
export class OfficeService {
  constructor(
    @InjectRepository(Office) private officeRepository: Repository<Office>,
    @InjectRepository(Company) private companyRepository: Repository<Company>,
  ) {}

  public async create(createOfficeDto: CreateOfficeDto): Promise<Office> {
    const company = await this.companyRepository.findOne({ where: { id: createOfficeDto.companyId } });
    if (!company) {
      throw new NotFoundException(`Company ${createOfficeDto.companyId} not found`);
    }

    const office = new Office();
    office.name = createOfficeDto.name;
    office.location = createOfficeDto.location;
    office.orderPrice = createOfficeDto.orderPrice;
    office.company = company;
    office.companyId = company.id;
    return await this.officeRepository.save(office);
  }

  public async findAll(): Promise<Office[]> {
    return await this.officeRepository.find({ relations: ['company'] });
  }

  public async findOne(id: number): Promise<Office> {
    const office = await this.officeRepository.findOne({ where: { id }, relations: ['company'] });
    if (!office) throw new NotFoundException(`Office ${id} not found`);
    return office;
  }

  public async findByCompanyId(companyId: number): Promise<Office[]> {
    return await this.officeRepository.find({ where: { company: { id: companyId } }, relations: ['company'] });
  }

  public async update(id: number, updateOfficeDto: UpdateOfficeDto): Promise<Office> {
    const office = await this.findOne(id);

    if (updateOfficeDto.companyId !== undefined) {
      const company = await this.companyRepository.findOne({ where: { id: updateOfficeDto.companyId } });
      if (!company) {
        throw new NotFoundException(`Company ${updateOfficeDto.companyId} not found`);
      }
      office.company = company;
      office.companyId = company.id;
    }

    Object.assign(office, updateOfficeDto);
    return await this.officeRepository.save(office);
  }

  public async softDelete(id: number): Promise<boolean> {
    const office = await this.findOne(id);
    const companyId = office.companyId ?? office.company?.id;
    if (!companyId) {
      throw new BadRequestException('Office is not associated with a company');
    }

    const activeOfficesCount = await this.officeRepository.count({
      where: { companyId, deletedAt: IsNull() },
    });
    if (activeOfficesCount <= 1) {
      throw new BadRequestException('Cannot delete the last office of a company');
    }

    const result = await this.officeRepository.softDelete(id);
    if (!result.affected) throw new NotFoundException(`Office ${id} not found`);
    return true;
  }
}
