import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: {
    getShipments: jest.Mock;
    getCustomerShipments: jest.Mock;
    getShipmentsRegisteredByEmployee: jest.Mock;
    getSentButNotReceivedShipments: jest.Mock;
    getShipmentsSentByCustomer: jest.Mock;
    getShipmentsReceivedByCustomer: jest.Mock;
    getOfficeRevenue: jest.Mock;
    getCompanyRevenue: jest.Mock;
    getCustomers: jest.Mock;
    getEmployees: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      getShipments: jest.fn(),
      getCustomerShipments: jest.fn(),
      getShipmentsRegisteredByEmployee: jest.fn(),
      getSentButNotReceivedShipments: jest.fn(),
      getShipmentsSentByCustomer: jest.fn(),
      getShipmentsReceivedByCustomer: jest.fn(),
      getOfficeRevenue: jest.fn(),
      getCompanyRevenue: jest.fn(),
      getCustomers: jest.fn(),
      getEmployees: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: service },
        { provide: AuthGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: RoleGuard, useValue: { canActivate: jest.fn().mockReturnValue(true) } },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
        { provide: Reflector, useValue: { getAllAndOverride: jest.fn() } },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  // Verifies: routes employee shipment report to dedicated service method.
  it('routes employee shipment report to dedicated service method', () => {
    controller.getShipmentsByEmployee('7');

    expect(service.getShipmentsRegisteredByEmployee).toHaveBeenCalledWith(7);
  });

  // Verifies: routes sent-not-received report to dedicated service method.
  it('routes sent-not-received report to dedicated service method', () => {
    controller.getSentButNotReceivedShipments();

    expect(service.getSentButNotReceivedShipments).toHaveBeenCalled();
  });

  // Verifies: routes sent-by-customer report to dedicated service method.
  it('routes sent-by-customer report to dedicated service method', () => {
    controller.getShipmentsSentByCustomer('9');

    expect(service.getShipmentsSentByCustomer).toHaveBeenCalledWith(9);
  });

  // Verifies: routes received-by-customer report to dedicated service method.
  it('routes received-by-customer report to dedicated service method', () => {
    controller.getShipmentsReceivedByCustomer('12');

    expect(service.getShipmentsReceivedByCustomer).toHaveBeenCalledWith(12);
  });

  // Verifies: passes createdAt period filters to office revenue report.
  it('passes createdAt period filters to office revenue report', () => {
    controller.getOfficeRevenue('2026-02-01T00:00:00.000Z', '2026-02-28T23:59:59.999Z');

    expect(service.getOfficeRevenue).toHaveBeenCalledWith({
      from: new Date('2026-02-01T00:00:00.000Z'),
      to: new Date('2026-02-28T23:59:59.999Z'),
    });
  });

  // Verifies: passes createdAt period filters to company revenue report.
  it('passes createdAt period filters to company revenue report', () => {
    controller.getCompanyRevenue('2026-02-01T00:00:00.000Z', '2026-02-28T23:59:59.999Z');

    expect(service.getCompanyRevenue).toHaveBeenCalledWith({
      from: new Date('2026-02-01T00:00:00.000Z'),
      to: new Date('2026-02-28T23:59:59.999Z'),
    });
  });
});
