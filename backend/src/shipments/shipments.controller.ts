import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
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
  create(@Body() createShipmentDto: CreateShipmentDto, @Request() req: any) {
    return this.shipmentsService.create(createShipmentDto, req.user.sub, req.user.roleId);
  }

  @Get()
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  findAll(@Request() req: any) {
    const { roleId, sub: userId } = req.user;
    if (roleId === 3) return this.shipmentsService.findByCustomerUserId(userId);
    if (roleId === 2) return this.shipmentsService.findByEmployeeUserId(userId);
    return this.shipmentsService.findAll();
  }

  @Get(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  findOne(@Param('id') id: string, @Request() req: any) {
    if (req.user?.roleId === 3) {
      return this.shipmentsService.findOneForCustomer(+id, req.user.sub);
    }
    return this.shipmentsService.findOne(+id);
  }

  @Get('tracking/:trackingNumber')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  findByTrackingNumber(@Param('trackingNumber') trackingNumber: string) {
    return this.shipmentsService.findByTrackingNumber(trackingNumber);
  }

  @Get('sender/:senderId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findBySender(@Param('senderId') senderId: string) {
    return this.shipmentsService.findBySenderId(+senderId);
  }

  @Get('office/:officeId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  findByOffice(@Param('officeId') officeId: string) {
    return this.shipmentsService.findByOfficeId(+officeId);
  }

  @Patch(':id')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  update(@Param('id') id: string, @Body() updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentsService.update(+id, updateShipmentDto);
  }

  @Patch(':id/customer-update')
  @Roles(UserRoles.CUSTOMER)
  updateByCustomer(@Param('id') id: string, @Body() updateShipmentDto: UpdateShipmentDto, @Request() req: any) {
    return this.shipmentsService.updateByCustomer(+id, updateShipmentDto, req.user.sub);
  }

  @Patch(':id/mark-in-transit')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  markInTransit(@Param('id') id: string) {
    return this.shipmentsService.markInTransit(+id);
  }

  @Patch(':id/mark-delivered')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  markDelivered(@Param('id') id: string) {
    return this.shipmentsService.markDelivered(+id);
  }

  @Patch(':id/cancel')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  cancel(@Param('id') id: string, @Request() req: any) {
    if (req.user?.roleId === 3) {
      return this.shipmentsService.cancelByCustomer(+id, req.user.sub);
    }
    return this.shipmentsService.cancel(+id);
  }

  @Delete(':id')
  @Roles(UserRoles.ADMIN)
  remove(@Param('id') id: string) {
    return this.shipmentsService.softDelete(+id);
  }
}
