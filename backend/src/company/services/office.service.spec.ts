import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { Office } from '../entities/office.entity';
import { OfficeService } from './office.service';

type MockRepo<T extends object = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepo = <T extends object = any>(): MockRepo<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
});

describe('OfficeService', () => {
  let service: OfficeService;
  let officeRepository: MockRepo<Office>;
  let companyRepository: MockRepo<Company>;

  beforeEach(async () => {
    officeRepository = createMockRepo<Office>();
    companyRepository = createMockRepo<Company>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfficeService,
        { provide: getRepositoryToken(Office), useValue: officeRepository },
        { provide: getRepositoryToken(Company), useValue: companyRepository },
      ],
    }).compile();

    service = module.get<OfficeService>(OfficeService);
  });

  // Verifies: should be defined.
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Verifies: create should throw when company is missing.
  it('create should throw when company is missing', async () => {
    companyRepository.findOne!.mockResolvedValue(null);

    await expect(
      service.create({ name: 'Office', location: 'Sofia', orderPrice: 12, companyId: 999 }),
    ).rejects.toThrow(NotFoundException);
  });

  // Verifies: create should save office with required company and price.
  it('create should save office with required company and price', async () => {
    const company = { id: 10 } as Company;
    companyRepository.findOne!.mockResolvedValue(company);
    officeRepository.save!.mockImplementation(async (x) => x);

    const created = await service.create({
      name: 'HQ',
      location: 'Plovdiv',
      orderPrice: 15,
      companyId: 10,
    });

    expect(created.companyId).toBe(10);
    expect(created.orderPrice).toBe(15);
    expect(created.company).toEqual(company);
  });

  // Verifies: findOne should throw when office is missing.
  it('findOne should throw when office is missing', async () => {
    officeRepository.findOne!.mockResolvedValue(null);

    await expect(service.findOne(55)).rejects.toThrow(NotFoundException);
  });

  // Verifies: update should throw when target office is missing.
  it('update should throw when target office is missing', async () => {
    officeRepository.findOne!.mockResolvedValue(null);

    await expect(service.update(123, { name: 'Updated' })).rejects.toThrow(NotFoundException);
  });

  // Verifies: update should throw when new company is missing.
  it('update should throw when new company is missing', async () => {
    officeRepository.findOne!.mockResolvedValue({ id: 1, companyId: 3, company: { id: 3 } } as Office);
    companyRepository.findOne!.mockResolvedValue(null);

    await expect(service.update(1, { companyId: 999 })).rejects.toThrow(NotFoundException);
  });

  // Verifies: softDelete should block deleting last active office.
  it('softDelete should block deleting last active office', async () => {
    officeRepository.findOne!.mockResolvedValue({ id: 7, companyId: 3, company: { id: 3 } } as Office);
    officeRepository.count!.mockResolvedValue(1);

    await expect(service.softDelete(7)).rejects.toThrow(BadRequestException);
    expect(officeRepository.count).toHaveBeenCalledWith({
      where: { companyId: 3, deletedAt: IsNull() },
    });
  });

  // Verifies: softDelete should delete when company has more than one active office.
  it('softDelete should delete when company has more than one active office', async () => {
    officeRepository.findOne!.mockResolvedValue({ id: 7, companyId: 3, company: { id: 3 } } as Office);
    officeRepository.count!.mockResolvedValue(2);
    officeRepository.softDelete!.mockResolvedValue({ affected: 1 });

    await expect(service.softDelete(7)).resolves.toBe(true);
  });
});
