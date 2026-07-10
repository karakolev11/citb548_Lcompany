import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('ShipmentsController', () => {
  let controller: ShipmentsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    findByCustomerUserId: jest.Mock;
    findBySenderId: jest.Mock;
    findByOfficeId: jest.Mock;
    update: jest.Mock;
    softDelete: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByCustomerUserId: jest.fn(),
      findBySenderId: jest.fn(),
      findByOfficeId: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentsController],
      providers: [
        {
          provide: ShipmentsService,
          useValue: service,
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: RoleGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() },
        },
        {
          provide: Reflector,
          useValue: { getAllAndOverride: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ShipmentsController>(ShipmentsController);
  });

  // Verifies: should be defined.
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Verifies: returns all shipments for employee users.
  it('returns all shipments for employee users', () => {
    controller.findAll({ user: { roleId: 2, sub: 15 } });

    expect(service.findAll).toHaveBeenCalled();
    expect(service.findByCustomerUserId).not.toHaveBeenCalled();
  });

  // Verifies: returns own shipments for customer users.
  it('returns own shipments for customer users', () => {
    controller.findAll({ user: { roleId: 3, sub: 44 } });

    expect(service.findByCustomerUserId).toHaveBeenCalledWith(44);
    expect(service.findAll).not.toHaveBeenCalled();
  });

  // Verifies: returns all shipments for admin users.
  it('returns all shipments for admin users', () => {
    controller.findAll({ user: { roleId: 1, sub: 5 } });

    expect(service.findAll).toHaveBeenCalled();
    expect(service.findByCustomerUserId).not.toHaveBeenCalled();
  });
});
