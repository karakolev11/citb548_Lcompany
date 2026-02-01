import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Get()
  findAll() {
    return this.shipmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(+id);
  }

  @Get('sender/:senderId')
  findBySender(@Param('senderId') senderId: string) {
    return this.shipmentsService.findBySenderId(+senderId);
  }

  @Get('receiver/:receiverId')
  findByReceiver(@Param('receiverId') receiverId: string) {
    return this.shipmentsService.findByReceiverId(+receiverId);
  }

  @Get('office/:officeId')
  findByOffice(@Param('officeId') officeId: string) {
    return this.shipmentsService.findByOfficeId(+officeId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentsService.update(+id, updateShipmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipmentsService.softDelete(+id);
  }
}
