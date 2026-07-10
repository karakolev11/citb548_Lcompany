import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Customer } from '../entities/customer.entity';
import { UsersService } from './users.service';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

describe('CustomerService', () => {
  let service: CustomerService;
  const customerRepository = { save: jest.fn() };
  const usersService = {
    findOneByUsername: jest.fn(),
    findOneByEmail: jest.fn(),
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
        CustomerService,
        { provide: getRepositoryToken(Customer), useValue: customerRepository },
        { provide: UsersService, useValue: usersService },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    jest.clearAllMocks();
  });

  // Verifies: should be defined.
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Verifies: creates customer with linked user account.
  it('creates customer with linked user account', async () => {
    usersService.findOneByUsername.mockResolvedValue(null);
    usersService.findOneByEmail.mockResolvedValue(null);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);
    manager.create.mockImplementation((_entity, payload) => payload);
    manager.save
      .mockResolvedValueOnce({ id: 20 })
      .mockResolvedValueOnce({ id: 30 });
    manager.findOneOrFail.mockResolvedValue({ id: 30, userId: 20 });
    dataSource.transaction.mockImplementation(async (callback: (txn: typeof manager) => unknown) => callback(manager));

    const result = await service.createWithUser({
      username: 'customer1',
      email: 'customer1@example.com',
      password: 'password123',
      firstName: 'Ivan',
      lastName: 'Customer',
    });

    expect(manager.create).toHaveBeenCalledWith(User, expect.objectContaining({
      username: 'customer1',
      roleId: 3,
    }));
    expect(manager.create).toHaveBeenCalledWith(Customer, expect.objectContaining({
      firstName: 'Ivan',
      lastName: 'Customer',
      userId: 20,
    }));
    expect(result).toEqual({ id: 30, userId: 20 });
  });
});
