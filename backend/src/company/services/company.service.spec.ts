import { Test, TestingModule } from '@nestjs/testing';
import { CompanyService } from './company.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from '../entities/company.entity';

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        { provide: getRepositoryToken(Company), useValue: {} },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  // Verifies: should be defined.
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
