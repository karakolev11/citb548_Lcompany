import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Shipment } from './entities/shipment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ShipmentStatus } from './enums/shipment-status.enum';
import { DeliveryMode } from './enums/delivery-mode.enum';
import { Office } from 'src/company/entities/office.entity';
import { Customer } from 'src/users/entities/customer.entity';
import { Employee } from 'src/users/entities/employee.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment) private shipmentRepository: Repository<Shipment>,
    @InjectRepository(Office) private officeRepository: Repository<Office>,
    @InjectRepository(Customer) private customerRepository: Repository<Customer>,
    @InjectRepository(Employee) private employeeRepository: Repository<Employee>,
  ) {}

  private generateTrackingNumber(): string {
    return `TRK-${Date.now()}-${Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')}`;
  }

  private ensureExisting(shipment: Shipment | null, id: number): Shipment {
    if (!shipment) throw new NotFoundException(`Shipment ${id} not found`);
    return shipment;
  }

  private assertCustomerCanMutate(shipment: Shipment): void {
    if (shipment.status !== ShipmentStatus.PENDING) {
      throw new BadRequestException('Customers can update or cancel only pending shipments');
    }
  }

  private async getCustomerIdByUserId(userId: number): Promise<number> {
    const customer = await this.customerRepository.findOne({ where: { userId } });
    if (!customer) throw new ForbiddenException('Customer profile not found for authenticated user');
    return customer.id;
  }

  private ensureShipmentOwnedByCustomer(shipment: Shipment, customerId: number): void {
    if (shipment.senderId !== customerId) {
      throw new ForbiddenException('You can access only your own shipments');
    }
  }

  private computePriceSnapshot(office: Office, weight: number, deliveryMode: DeliveryMode): number {
    const weightPrice = Number(office.pricePerKg) * weight;
    const surcharge = deliveryMode === DeliveryMode.OFFICE
      ? Number(office.officeSurcharge)
      : Number(office.addressSurcharge);
    return weightPrice + surcharge;
  }

  public async create(dto: CreateShipmentDto, userId: number, roleId: number): Promise<Shipment> {
    let office: Office;
    let senderId: number;

    if (roleId === 3) {
      const customer = await this.customerRepository.findOne({ where: { userId } });
      if (!customer) throw new ForbiddenException('Customer profile not found');
      senderId = customer.id;
      if (!dto.officeId) throw new BadRequestException('officeId is required');
      const found = await this.officeRepository.findOne({ where: { id: dto.officeId } });
      if (!found) throw new NotFoundException(`Office ${dto.officeId} not found`);
      office = found;
    } else if (roleId === 2) {
      const employee = await this.employeeRepository.findOne({ where: { userId } });
      if (!employee) throw new ForbiddenException('Employee profile not found');
      if (!employee.officeId) throw new BadRequestException('Employee has no assigned office');
      const found = await this.officeRepository.findOne({ where: { id: employee.officeId } });
      if (!found) throw new NotFoundException('Employee office not found');
      office = found;
      if (!dto.senderCustomerId) throw new BadRequestException('senderCustomerId is required for employee-created shipments');
      senderId = dto.senderCustomerId;
    } else {
      if (!dto.officeId) throw new BadRequestException('officeId is required');
      const found = await this.officeRepository.findOne({ where: { id: dto.officeId } });
      if (!found) throw new NotFoundException(`Office ${dto.officeId} not found`);
      office = found;
      if (!dto.senderCustomerId) throw new BadRequestException('senderCustomerId is required');
      senderId = dto.senderCustomerId;
    }

    const priceSnapshot = this.computePriceSnapshot(office, dto.weight, dto.deliveryMode);

    const shipment = new Shipment();
    shipment.receiverName = dto.receiverName;
    shipment.deliveryMode = dto.deliveryMode;
    shipment.weight = dto.weight;
    shipment.description = dto.description;
    shipment.status = ShipmentStatus.PENDING;
    shipment.trackingNumber = this.generateTrackingNumber();
    shipment.priceSnapshot = priceSnapshot;
    shipment.creatorId = userId;
    shipment.creatorRole = roleId;
    shipment.senderId = senderId;
    (shipment as any).office = { id: office.id };

    if (dto.deliveryMode === DeliveryMode.ADDRESS) {
      shipment.deliveredAddress = dto.deliveredAddress;
      shipment.deliveredCity = dto.deliveredCity;
      shipment.deliveredZip = dto.deliveredZip;
      shipment.deliveredCountry = dto.deliveredCountry;
    }

    return await this.shipmentRepository.save(shipment);
  }

  public async findAll(): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ relations: ['sender', 'office'] });
  }

  public async findOne(id: number): Promise<Shipment | null> {
    return await this.shipmentRepository.findOne({ where: { id }, relations: ['sender', 'office'] });
  }

  public async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    return await this.shipmentRepository.findOne({ where: { trackingNumber }, relations: ['sender', 'office'] });
  }

  public async findByCustomerUserId(userId: number): Promise<Shipment[]> {
    const customer = await this.customerRepository.findOne({ where: { userId } });
    if (!customer) return [];
    return this.shipmentRepository.find({ where: { senderId: customer.id }, relations: ['sender', 'office'] });
  }

  public async findByEmployeeUserId(userId: number): Promise<Shipment[]> {
    const employee = await this.employeeRepository.findOne({ where: { userId } });
    if (!employee?.officeId) return [];
    return this.findByOfficeId(employee.officeId);
  }

  public async findBySenderId(senderId: number): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ where: { senderId }, relations: ['sender', 'office'] });
  }

  public async findByOfficeId(officeId: number): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ where: { officeId }, relations: ['sender', 'office'] });
  }

  public async findOneForCustomer(id: number, userId: number): Promise<Shipment | null> {
    const shipment = this.ensureExisting(await this.findOne(id), id);
    const customerId = await this.getCustomerIdByUserId(userId);
    this.ensureShipmentOwnedByCustomer(shipment, customerId);
    return shipment;
  }

  public async update(id: number, updateShipmentDto: UpdateShipmentDto): Promise<Shipment | null> {
    const shipment = await this.findOne(id);
    if (!shipment) return null;
    Object.assign(shipment, updateShipmentDto);
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
      deliveredAddress: updateShipmentDto.deliveredAddress,
      deliveredCity: updateShipmentDto.deliveredCity,
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

  public async cancelByCustomer(id: number, userId: number): Promise<Shipment> {
    const shipment = this.ensureExisting(await this.findOne(id), id);
    const customerId = await this.getCustomerIdByUserId(userId);
    this.ensureShipmentOwnedByCustomer(shipment, customerId);
    this.assertCustomerCanMutate(shipment);
    return this.cancel(id);
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
    const result = await this.shipmentRepository.softDelete(id);
    return result.affected! > 0;
  }
}
