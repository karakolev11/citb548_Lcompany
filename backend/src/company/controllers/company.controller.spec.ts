import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from '../services/company.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
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

    controller = module.get<CompanyController>(CompanyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
