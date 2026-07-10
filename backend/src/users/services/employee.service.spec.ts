import { Test, TestingModule } from '@nestjs/testing';
import { EmployeeService } from './employee.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Employee } from '../entities/employee.entity';
import { Office } from 'src/company/entities/office.entity';
import { UsersService } from './users.service';
import { DataSource } from 'typeorm';
import { EmployeeType } from '../enums/employee-type.enum';
import * as bcrypt from 'bcrypt';

describe('EmployeeService', () => {
  let service: EmployeeService;
  const employeeRepository = { save: jest.fn(), findOne: jest.fn() };
  const officeRepository = { findOne: jest.fn() };
  const usersService = {
    findOneByUsername: jest.fn(),
    findOneByEmail: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  };
  const manager = {
    create: jest.fn(),
    save: jest.fn(),
    findOneOrFail: jest.fn(),
  };
  const dataSource = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        { provide: getRepositoryToken(Employee), useValue: employeeRepository },
        { provide: getRepositoryToken(Office), useValue: officeRepository },
        { provide: UsersService, useValue: usersService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates employee with required employee type', async () => {
    officeRepository.findOne.mockResolvedValue({ id: 3, companyId: 9 });
    employeeRepository.save.mockImplementation(async (entity) => ({ id: 1, ...entity }));

    const result = await service.create({
      firstName: 'Ana',
      lastName: 'Ivanova',
      userId: 5,
      officeId: 3,
      employeeType: EmployeeType.COURIER,
    });

    expect(result.employeeType).toBe(EmployeeType.COURIER);
    expect(result.companyId).toBe(9);
  });

  it('creates employee with user and persists employee type', async () => {
    officeRepository.findOne.mockResolvedValue({ id: 3, companyId: 9 });
    usersService.findOneByUsername.mockResolvedValue(null);
    usersService.findOneByEmail.mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

    manager.create.mockImplementation((_entity, payload) => payload);
    manager.save
      .mockResolvedValueOnce({ id: 10 })
      .mockResolvedValueOnce({ id: 11 });
    manager.findOneOrFail.mockResolvedValue({ id: 11, employeeType: EmployeeType.OFFICE_STAFF });
    dataSource.transaction.mockImplementation(async (callback: (txn: typeof manager) => unknown) => callback(manager));

    const result = await service.createWithUser({
      username: 'staff1',
      email: 'staff1@example.com',
      password: 'password123',
      firstName: 'Petar',
      lastName: 'Petrov',
      officeId: 3,
      employeeType: EmployeeType.OFFICE_STAFF,
    });

    expect(manager.create).toHaveBeenCalledWith(Employee, expect.objectContaining({
      employeeType: EmployeeType.OFFICE_STAFF,
    }));
    expect(result.employeeType).toBe(EmployeeType.OFFICE_STAFF);
  });
});
