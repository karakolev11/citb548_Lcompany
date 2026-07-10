import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from './reports.service';
import { Shipment } from 'src/shipments/entities/shipment.entity';
import { Office } from 'src/company/entities/office.entity';
import { Company } from 'src/company/entities/company.entity';
import { Customer } from 'src/users/entities/customer.entity';
import { Employee } from 'src/users/entities/employee.entity';
import { EmployeeType } from 'src/users/enums/employee-type.enum';

describe('ReportsService', () => {
  let service: ReportsService;

  const shipmentRepo = {
    find: jest.fn(),
    count: jest.fn(),
  };
  const officeRepo = { find: jest.fn() };
  const companyRepo = {};
  const customerRepo = { find: jest.fn(), findOne: jest.fn() };
  const employeeRepo = { find: jest.fn(), findOne: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Shipment), useValue: shipmentRepo },
        { provide: getRepositoryToken(Office), useValue: officeRepo },
        { provide: getRepositoryToken(Company), useValue: companyRepo },
        { provide: getRepositoryToken(Customer), useValue: customerRepo },
        { provide: getRepositoryToken(Employee), useValue: employeeRepo },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  it('returns customer shipments where customer is sender or receiver', async () => {
    customerRepo.findOne.mockResolvedValue({ id: 12, userId: 100 });
    shipmentRepo.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const result = await service.getCustomerShipments(100, { status: undefined });

    expect(shipmentRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: [{ senderId: 12 }, { receiverCustomerId: 12 }],
    }));
    expect(result).toHaveLength(2);
  });

  it('counts sent and received shipments in customer report', async () => {
    customerRepo.find.mockResolvedValue([
      { id: 4, firstName: 'A', lastName: 'B', company: null },
    ]);
    shipmentRepo.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);

    const result = await service.getCustomers();

    expect(result).toEqual([
      expect.objectContaining({
        customerId: 4,
        sentCount: 3,
        receivedCount: 2,
      }),
    ]);
  });

  it('returns employee type in employee report', async () => {
    employeeRepo.find.mockResolvedValue([
      {
        id: 8,
        firstName: 'Mariya',
        lastName: 'Stoeva',
        employeeType: EmployeeType.COURIER,
        jobTitle: 'Courier',
        department: 'Operations',
        company: { name: 'LCompany' },
      },
    ]);

    const result = await service.getEmployees();

    expect(result).toEqual([
      expect.objectContaining({
        employeeId: 8,
        employeeType: EmployeeType.COURIER,
      }),
    ]);
  });

  it('returns shipments registered by a given employee', async () => {
    employeeRepo.findOne.mockResolvedValue({ id: 7, userId: 101 });
    shipmentRepo.find.mockResolvedValue([{ id: 2 }]);

    const result = await service.getShipmentsRegisteredByEmployee(7);

    expect(shipmentRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { creatorId: 101, creatorRole: 2 },
    }));
    expect(result).toEqual([{ id: 2 }]);
  });

  it('returns shipments sent but not received', async () => {
    shipmentRepo.find.mockResolvedValue([
      { id: 1, status: 'PENDING' },
      { id: 2, status: 'IN_TRANSIT' },
      { id: 3, status: 'DELIVERED' },
      { id: 4, status: 'CANCELLED' },
    ]);

    const result = await service.getSentButNotReceivedShipments();

    expect(result).toEqual([
      { id: 1, status: 'PENDING' },
      { id: 2, status: 'IN_TRANSIT' },
    ]);
  });

  it('returns shipments sent by a customer', async () => {
    shipmentRepo.find.mockResolvedValue([{ id: 5 }]);

    const result = await service.getShipmentsSentByCustomer(9);

    expect(shipmentRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { senderId: 9 },
    }));
    expect(result).toEqual([{ id: 5 }]);
  });

  it('returns shipments received by a customer', async () => {
    shipmentRepo.find.mockResolvedValue([{ id: 6 }]);

    const result = await service.getShipmentsReceivedByCustomer(12);

    expect(shipmentRepo.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { receiverCustomerId: 12 },
    }));
    expect(result).toEqual([{ id: 6 }]);
  });

  it('filters office revenue by shipment createdAt period', async () => {
    officeRepo.find.mockResolvedValue([
      { id: 1, name: 'Office 1', company: { id: 20, name: 'LCompany' } },
    ]);
    shipmentRepo.find.mockResolvedValue([
      { id: 1, createdAt: new Date('2026-01-10T00:00:00.000Z'), priceSnapshot: 10 },
      { id: 2, createdAt: new Date('2026-02-10T00:00:00.000Z'), priceSnapshot: 20 },
      { id: 3, createdAt: new Date('2026-03-10T00:00:00.000Z'), priceSnapshot: 30 },
    ]);

    const result = await service.getOfficeRevenue({
      from: new Date('2026-02-01T00:00:00.000Z'),
      to: new Date('2026-02-28T23:59:59.999Z'),
    });

    expect(result).toEqual([
      expect.objectContaining({
        officeId: 1,
        shipmentCount: 1,
        revenue: 20,
      }),
    ]);
  });

  it('aggregates company revenue from createdAt-filtered office revenue', async () => {
    officeRepo.find.mockResolvedValue([
      { id: 1, name: 'Office 1', company: { id: 20, name: 'LCompany' } },
      { id: 2, name: 'Office 2', company: { id: 20, name: 'LCompany' } },
    ]);
    shipmentRepo.find
      .mockResolvedValueOnce([
        { id: 1, createdAt: new Date('2026-02-10T00:00:00.000Z'), priceSnapshot: 10 },
        { id: 2, createdAt: new Date('2026-04-10T00:00:00.000Z'), priceSnapshot: 40 },
      ])
      .mockResolvedValueOnce([
        { id: 3, createdAt: new Date('2026-02-20T00:00:00.000Z'), priceSnapshot: 15 },
      ]);

    const result = await service.getCompanyRevenue({
      from: new Date('2026-02-01T00:00:00.000Z'),
      to: new Date('2026-02-28T23:59:59.999Z'),
    });

    expect(result).toEqual([
      {
        companyId: 20,
        companyName: 'LCompany',
        officeCount: 2,
        totalRevenue: 25,
      },
    ]);
  });
});