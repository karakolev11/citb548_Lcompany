import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsController } from './shipments.controller';
import { ShipmentsService } from './shipments.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('ShipmentsController', () => {
  let controller: ShipmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShipmentsController],
      providers: [
        {
          provide: ShipmentsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            findBySenderId: jest.fn(),
            findByReceiverId: jest.fn(),
            findByOfficeId: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
          },
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
