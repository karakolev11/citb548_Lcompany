import { Test, TestingModule } from '@nestjs/testing';
import { ShipmentsService } from './shipments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shipment } from './entities/shipment.entity';
import { ShipmentStatus } from './enums/shipment-status.enum';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Office } from 'src/company/entities/office.entity';
import { Customer } from 'src/users/entities/customer.entity';

describe('ShipmentsService', () => {
  let service: ShipmentsService;
  const repositoryMock = {
    findOne: jest.fn(),
    save: jest.fn(),
    softDelete: jest.fn(),
  };
  const officeRepositoryMock = {
    findOne: jest.fn(),
  };
  const customerRepositoryMock = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: getRepositoryToken(Shipment), useValue: repositoryMock },
        { provide: getRepositoryToken(Office), useValue: officeRepositoryMock },
        { provide: getRepositoryToken(Customer), useValue: customerRepositoryMock },
      ],
    }).compile();

    service = module.get<ShipmentsService>(ShipmentsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('marks pending shipment as in transit', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.PENDING });
    repositoryMock.save.mockImplementation(async (entity) => entity);

    const result = await service.markInTransit(1);

    expect(result.status).toBe(ShipmentStatus.IN_TRANSIT);
    expect(repositoryMock.save).toHaveBeenCalled();
  });

  it('rejects markInTransit for non-pending shipment', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.DELIVERED });

    await expect(service.markInTransit(1)).rejects.toThrow(BadRequestException);
  });

  it('marks in-transit shipment as delivered and sets actual delivery date', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.IN_TRANSIT });
    repositoryMock.save.mockImplementation(async (entity) => entity);

    const result = await service.markDelivered(1);

    expect(result.status).toBe(ShipmentStatus.DELIVERED);
    expect(result.actualDeliveryDate).toBeInstanceOf(Date);
  });

  it('rejects customer update for non-pending shipment', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.IN_TRANSIT, senderId: 99 });
    customerRepositoryMock.findOne.mockResolvedValue({ id: 99, userId: 10 });

    await expect(service.updateByCustomer(1, { description: 'new' }, 10)).rejects.toThrow(BadRequestException);
  });

  it('allows customer update for pending shipment', async () => {
    repositoryMock.findOne
      .mockResolvedValueOnce({ id: 1, status: ShipmentStatus.PENDING, senderId: 99 })
      .mockResolvedValueOnce({ id: 1, status: ShipmentStatus.PENDING, description: 'old' });
    repositoryMock.save.mockImplementation(async (entity) => entity);
    customerRepositoryMock.findOne.mockResolvedValue({ id: 99, userId: 10 });

    const result = await service.updateByCustomer(1, { description: 'new' }, 10);

    expect(result?.description).toBe('new');
  });

  it('rejects customer update for shipment not owned by customer', async () => {
    repositoryMock.findOne.mockResolvedValue({ id: 1, status: ShipmentStatus.PENDING, senderId: 50, receiverId: 51 });
    customerRepositoryMock.findOne.mockResolvedValue({ id: 99, userId: 10 });

    await expect(service.updateByCustomer(1, { description: 'new' }, 10)).rejects.toThrow(ForbiddenException);
  });

  it('sets order price snapshot from office when creating shipment', async () => {
    officeRepositoryMock.findOne.mockResolvedValue({ id: 5, orderPrice: 42 });
    repositoryMock.save.mockImplementation(async (entity) => entity);

    const result = await service.create({
      officeId: 5,
      weight: 3,
    });

    expect(result.orderPriceSnapshot).toBe(42);
  });
});
