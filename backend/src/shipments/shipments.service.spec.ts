import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsService } from './shipments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatus } from './enums/shipment-status.enum';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Office } from 'src/company/entities/office.entity';
import { Customer } from 'src/users/entities/customer.entity';
import { Employee } from 'src/users/entities/employee.entity';
import { DeliveryMode } from './enums/delivery-mode.enum';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  const repositoryMock = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
  };
  const officeRepositoryMock = {
    findOne: jest.fn(),
  };
  const customerRepositoryMock = {
    findOne: jest.fn(),
  };
  const employeeRepositoryMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: getRepositoryToken(Shipment), useValue: repositoryMock },
        { provide: getRepositoryToken(Office), useValue: officeRepositoryMock },
        { provide: getRepositoryToken(Customer), useValue: customerRepositoryMock },
        { provide: getRepositoryToken(Employee), useValue: employeeRepositoryMock },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
    jest.clearAllMocks();
  });

  // Verifies: should be defined.
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Verifies: marks pending shipment as in transit.
  it('marks pending shipment as in transit', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.PENDING });
    repositoryMock.save.mockImplementation(async (entity) => entity);

    const result = await service.markInTransit(1);

    expect(result.status).toBe(ShipmentStatus.IN_TRANSIT);
    expect(repositoryMock.save).toHaveBeenCalled();
  });

  // Verifies: rejects markInTransit for non-pending shipment.
  it('rejects markInTransit for non-pending shipment', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.DELIVERED });

    await expect(service.markInTransit(1)).rejects.toThrow(BadRequestException);
  });

  // Verifies: marks in-transit shipment as delivered and sets actual delivery date.
  it('marks in-transit shipment as delivered and sets actual delivery date', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.IN_TRANSIT });
    repositoryMock.save.mockImplementation(async (entity) => entity);

    const result = await service.markDelivered(1);

    expect(result.status).toBe(ShipmentStatus.DELIVERED);
    expect(result.actualDeliveryDate).toBeInstanceOf(Date);
  });

  // Verifies: rejects customer update for non-pending shipment.
  it('rejects customer update for non-pending shipment', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.IN_TRANSIT, senderId: 99 });
    customerRepositoryMock.findOne.mockResolvedValue({ id: 99, userId: 10 });

    await expect(service.updateByCustomer(1, { description: 'new' }, 10)).rejects.toThrow(BadRequestException);
  });

  // Verifies: allows customer update for pending shipment.
  it('allows customer update for pending shipment', async () => {
    repositoryMock.findOne
      .mockResolvedValueOnce({ id: 1, status: ShipmentStatus.PENDING, senderId: 99 })
      .mockResolvedValueOnce({ id: 1, status: ShipmentStatus.PENDING, description: 'old' });
    repositoryMock.save.mockImplementation(async (entity) => entity);
    customerRepositoryMock.findOne.mockResolvedValue({ id: 99, userId: 10 });

    const result = await service.updateByCustomer(1, { description: 'new' }, 10);

    expect(result?.description).toBe('new');
  });

  // Verifies: rejects customer update for shipment not owned by customer.
  it('rejects customer update for shipment not owned by customer', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.PENDING, senderId: 50, receiverCustomerId: 51 });
    customerRepositoryMock.findOne.mockResolvedValue({ id: 99, userId: 10 });

    await expect(service.updateByCustomer(1, { description: 'new' }, 10)).rejects.toThrow(ForbiddenException);
  });

  // Verifies: creates shipment with computed price snapshot and receiver customer fallback name.
  it('creates shipment with computed price snapshot and receiver customer fallback name', async () => {
    officeRepositoryMock.findOne.mockResolvedValue({ id: 5, pricePerKg: 10, officeSurcharge: 4, addressSurcharge: 8 });
    customerRepositoryMock.findOne
      .mockResolvedValueOnce({ id: 11, userId: 10 })
      .mockResolvedValueOnce({ id: 7, firstName: 'Jane', lastName: 'Receiver' });
    repositoryMock.save.mockImplementation(async (entity) => entity);

    const result = await service.create({
      receiverCustomerId: 7,
      officeId: 5,
      deliveryMode: DeliveryMode.OFFICE,
      weight: 3,
    }, 10, 3);

    expect(result.priceSnapshot).toBe(34);
    expect(result.receiverCustomerId).toBe(7);
    expect(result.receiverName).toBe('Jane Receiver');
  });

  // Verifies: returns shipments where customer is sender or receiver.
  it('returns shipments where customer is sender or receiver', async () => {
    customerRepositoryMock.findOne.mockResolvedValue({ id: 99, userId: 10 });
    repositoryMock.find.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const result = await service.findByCustomerUserId(10);

    expect(repositoryMock.find).toHaveBeenCalledWith(expect.objectContaining({
      where: [{ senderId: 99 }, { receiverCustomerId: 99 }],
    }));
    expect(result).toHaveLength(2);
  });

  // Verifies: allows customer to read shipment where they are receiver.
  it('allows customer to read shipment where they are receiver', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, receiverCustomerId: 99, senderId: 50, status: ShipmentStatus.PENDING });
    customerRepositoryMock.findOne.mockResolvedValue({ id: 99, userId: 10 });

    const result = await service.findOneForCustomer(1, 10);

    expect(result?.id).toBe(1);
  });

  // Verifies: requires receiver name or receiver customer when creating shipment.
  it('requires receiver name or receiver customer when creating shipment', async () => {
    officeRepositoryMock.findOne.mockResolvedValue({ id: 5, pricePerKg: 10, officeSurcharge: 4, addressSurcharge: 8 });
    customerRepositoryMock.findOne.mockResolvedValue({ id: 11, userId: 10 });

    await expect(service.create({
      officeId: 5,
      deliveryMode: DeliveryMode.OFFICE,
      weight: 3,
    }, 10, 3)).rejects.toThrow(BadRequestException);
  });
});
