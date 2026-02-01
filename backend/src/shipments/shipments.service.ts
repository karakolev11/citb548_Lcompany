import { Injectable } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { Shipment } from './entities/shipment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ShipmentsService {
  constructor(@InjectRepository(Shipment) private shipmentRepository: Repository<Shipment>) {}

  public async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    const shipment = new Shipment();
    shipment.weight = createShipmentDto.weight;
    shipment.deliveredAddress = createShipmentDto.deliveredAddress;
    shipment.deliveredCity = createShipmentDto.deliveredCity;
    shipment.deliveredZip = createShipmentDto.deliveredZip;
    shipment.deliveredCountry = createShipmentDto.deliveredCountry;
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

  public async findBySenderId(senderId: number): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ where: { senderId }, relations: ['sender', 'receiver', 'office'] });
  }

  public async findByReceiverId(receiverId: number): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ where: { receiverId }, relations: ['sender', 'receiver', 'office'] });
  }

  public async findByOfficeId(officeId: number): Promise<Shipment[]> {
    return await this.shipmentRepository.find({ where: { officeId }, relations: ['sender', 'receiver', 'office'] });
  }

  public async update(id: number, updateShipmentDto: UpdateShipmentDto): Promise<Shipment | null> {
    const shipment = await this.findOne(id);
    if (!shipment) return null;
    Object.assign(shipment, updateShipmentDto);
    if ((updateShipmentDto as any).senderId) (shipment as any).sender = { id: (updateShipmentDto as any).senderId };
    if ((updateShipmentDto as any).receiverId) (shipment as any).receiver = { id: (updateShipmentDto as any).receiverId };
    if ((updateShipmentDto as any).officeId) (shipment as any).office = { id: (updateShipmentDto as any).officeId };
    return await this.shipmentRepository.save(shipment);
  }

  public async softDelete(id: number): Promise<boolean> {
    const result = await this.shipmentRepository.softDelete(id);
    return result.affected! > 0;
  }
}
