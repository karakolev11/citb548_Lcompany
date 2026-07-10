import { Test, TestingModule } from '@nestjs/testing';
import { CustomersController } from './customers.controller';
import { CustomerService } from '../services/customer.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('CustomersController', () => {
  let controller: CustomersController;
  let service: {
    create: jest.Mock;
    createWithUser: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findByUserId: jest.Mock;
    findByCompanyId: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      createWithUser: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUserId: jest.fn(),
      findByCompanyId: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomersController],
      providers: [
        { provide: CustomerService, useValue: service },
        { provide: AuthGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: RoleGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    controller = module.get<CustomersController>(CustomersController);
  });

  it('routes admin customer create-with-user to service', () => {
    const payload = {
      username: 'customer1',
      email: 'customer1@example.com',
      password: 'password123',
      firstName: 'Ivan',
      lastName: 'Customer',
    };

    controller.createWithUser(payload);

    expect(service.createWithUser).toHaveBeenCalledWith(payload);
  });
});