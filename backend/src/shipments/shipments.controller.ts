import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/common/enums/user-roles.enum';

@Controller('shipments')
@UseGuards(AuthGuard, RoleGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Get()
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findAll() {
    return this.shipmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(+id);
  }

  @Get('sender/:senderId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  findBySender(@Param('senderId') senderId: string) {
    return this.shipmentsService.findBySenderId(+senderId);
  }

  @Get('receiver/:receiverId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  findByReceiver(@Param('receiverId') receiverId: string) {
    return this.shipmentsService.findByReceiverId(+receiverId);
  }

  @Get('office/:officeId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findByOffice(@Param('officeId') officeId: string) {
    return this.shipmentsService.findByOfficeId(+officeId);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  update(@Param('id') id: string, @Body() updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentsService.update(+id, updateShipmentDto);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  remove(@Param('id') id: string) {
    return this.shipmentsService.softDelete(+id);
  }
}
