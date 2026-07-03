import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Shipment } from './entities/shipment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShipmentStatus } from './enums/shipment-status.enum';
import { Office } from 'src/company/entities/office.entity';
import { Customer } from 'src/users/entities/customer.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment) private shipmentRepository: Repository<Shipment>,
    @InjectRepository(Office) private officeRepository: Repository<Office>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
  ) {}

  private generateTrackingNumber(): string {
    return `TRK-${Date.now()}-${Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')}`;
  }

  private ensureExisting(shipment: Shipment | null, id: number): Shipment {
    if (!shipment) {
      throw new NotFoundException(`Shipment ${id} not found`);
    }
    return shipment;
  }

  private assertCustomerCanMutate(shipment: Shipment): void {
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException('Customers can update or cancel only pending shipments');
    }
  }

  private async getCustomerIdByUserId(userId: number): Promise<number> {
    const customer = await this.customerRepository.findOne({ where: { userId } });
    if (!customer) {
      throw new ForbiddenException('Customer profile not found for authenticated user');
    }
    return customer.id;
  }

  private ensureShipmentOwnedByCustomer(shipment: Shipment, customerId: number): void {
    if (shipment.senderId !== customerId && shipment.receiverId !== customerId) {
      throw new ForbiddenException('You can access only your own shipments');
    }
  }

  public async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    const shipment = new Shipment();
    shipment.weight = createShipmentDto.weight;
    shipment.deliveredAddress = createShipmentDto.deliveredAddress;
    shipment.deliveredCity = createShipmentDto.deliveredCity;
    shipment.deliveredZip = createShipmentDto.deliveredZip;
    shipment.deliveredCountry = createShipmentDto.deliveredCountry;
    shipment.description = createShipmentDto.description;
    shipment.status = createShipmentDto.status ?? ShipmentStatus.PENDING;
    shipment.trackingNumber = this.generateTrackingNumber();
    if (createShipmentDto.orderPriceSnapshot !== undefined) {
      shipment.orderPriceSnapshot = createShipmentDto.orderPriceSnapshot;
    } else if (createShipmentDto.officeId) {
      const office = await this.officeRepository.findOne({ where: { id: createShipmentDto.officeId } });
      shipment.orderPriceSnapshot = office?.orderPrice ?? 0;
    }
    shipment.estimatedDeliveryDate = createShipmentDto.estimatedDeliveryDate
      ? new Date(createShipmentDto.estimatedDeliveryDate)
      : undefined;
    if (createShipmentDto.senderId) (shipment as any).sender = { id: createShipmentDto.senderId };
    if (createShipmentDto.receiverId) (shipment as any).receiver = { id: createShipmentDto.receiverId };
    if (createShipmentDto.officeId) (shipment as any).office = { id: createShipmentDto.officeId };
    return await this.shipmentRepository.save(shipment);
  }

  public async findAll(): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ relations: ['sender', 'receiver', 'office'] });
  }

  public async findOne(id: number): Promise<Shipment | null> {
    return await this.shipmentRepository.findOne({ where: { id }, relations: ['sender', 'receiver', 'office'] });
  }

  public async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    return await this.shipmentRepository.findOne({
      where: { trackingNumber },
      relations: ['sender', 'receiver', 'office'],
    });
  }

  public async findOneForCustomer(id: number, userId: number): Promise<Shipment | null> {
    const shipment = this.ensureExisting(await this.findOne(id), id);
    const customerId = await this.getCustomerIdByUserId(userId);
    this.ensureShipmentOwnedByCustomer(shipment, customerId);
    return shipment;
  }

  public async findByTrackingNumberForCustomer(trackingNumber: string, userId: number): Promise<Shipment | null> {
    const shipment = await this.findByTrackingNumber(trackingNumber);
    if (!shipment) {
      return null;
    }
    const customerId = await this.getCustomerIdByUserId(userId);
    this.ensureShipmentOwnedByCustomer(shipment, customerId);
    return shipment;
  }

  public async findBySenderId(senderId: number): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ where: { senderId }, relations: ['sender', 'receiver', 'office'] });
  }

  public async findBySenderIdForCustomer(senderId: number, userId: number): Promise<Shipment[]> {
    const customerId = await this.getCustomerIdByUserId(userId);
    if (customerId !== senderId) {
      throw new ForbiddenException('Customers can query sender shipments only for themselves');
    }
    return this.findBySenderId(senderId);
  }

  public async findByReceiverId(receiverId: number): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ where: { receiverId }, relations: ['sender', 'receiver', 'office'] });
  }

  public async findByReceiverIdForCustomer(receiverId: number, userId: number): Promise<Shipment[]> {
    const customerId = await this.getCustomerIdByUserId(userId);
    if (customerId !== receiverId) {
      throw new ForbiddenException('Customers can query receiver shipments only for themselves');
    }
    return this.findByReceiverId(receiverId);
  }

  public async findByOfficeId(officeId: number): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ where: { officeId }, relations: ['sender', 'receiver', 'office'] });
  }

  public async update(id: number, updateShipmentDto: UpdateShipmentDto): Promise<Shipment | null> {
    const shipment = await this.findOne(id);
    if (!shipment) return null;
    Object.assign(shipment, updateShipmentDto);
    if (updateShipmentDto.estimatedDeliveryDate) {
      shipment.estimatedDeliveryDate = new Date(updateShipmentDto.estimatedDeliveryDate);
    }
    if ((updateShipmentDto as any).senderId) (shipment as any).sender = { id: (updateShipmentDto as any).senderId };
    if ((updateShipmentDto as any).receiverId) (shipment as any).receiver = { id: (updateShipmentDto as any).receiverId };
    if ((updateShipmentDto as any).officeId) (shipment as any).office = { id: (updateShipmentDto as any).officeId };
    return await this.shipmentRepository.save(shipment);
  }

  public async updateByCustomer(id: number, updateShipmentDto: UpdateShipmentDto, userId: number): Promise<Shipment | null> {
    const shipment = this.ensureExisting(await this.findOne(id), id);
    const customerId = await this.getCustomerIdByUserId(userId);
    this.ensureShipmentOwnedByCustomer(shipment, customerId);
    this.assertCustomerCanMutate(shipment);

    const customerSafeUpdate: UpdateShipmentDto = {
      weight: updateShipmentDto.weight,
      description: updateShipmentDto.description,
      estimatedDeliveryDate: updateShipmentDto.estimatedDeliveryDate,
      deliveredAddress: updateShipmentDto.deliveredAddress,
      deliveredCity: updateShipmentDto.deliveredCity,
      deliveredState: updateShipmentDto.deliveredState,
      deliveredZip: updateShipmentDto.deliveredZip,
      deliveredCountry: updateShipmentDto.deliveredCountry,
    };

    return this.update(id, customerSafeUpdate);
  }

  public async markInTransit(id: number): Promise<Shipment> {
    const shipment = this.ensureExisting(await this.findOne(id), id);
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException('Only pending shipments can be marked in transit');
    }

    shipment.status = ShipmentStatus.IN_TRANSIT;
    return await this.shipmentRepository.save(shipment);
  }

  public async markDelivered(id: number): Promise<Shipment> {
    const shipment = this.ensureExisting(await this.findOne(id), id);
    if (shipment.status !== ShipmentStatus.IN_TRANSIT) {
      throw new BadRequestException('Only in-transit shipments can be marked delivered');
    }

    shipment.status = ShipmentStatus.DELIVERED;
    shipment.actualDeliveryDate = new Date();
    return await this.shipmentRepository.save(shipment);
  }

  public async cancel(id: number): Promise<Shipment> {
    const shipment = this.ensureExisting(await this.findOne(id), id);
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException('Only pending shipments can be cancelled');
    }

    shipment.status = ShipmentStatus.CANCELLED;
    return await this.shipmentRepository.save(shipment);
  }

  public async softDelete(id: number): Promise<boolean> {
    const result = await this.shipmentRepository.softDelete(id);
    return result.affected! > 0;
  }

  public async softDeleteByCustomer(id: number, userId: number): Promise<boolean> {
    const shipment = this.ensureExisting(await this.findOne(id), id);
    const customerId = await this.getCustomerIdByUserId(userId);
    this.ensureShipmentOwnedByCustomer(shipment, customerId);
    this.assertCustomerCanMutate(shipment);
    return this.softDelete(id);
  }
}
