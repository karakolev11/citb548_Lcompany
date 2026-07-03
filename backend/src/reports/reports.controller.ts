import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ReportsService, ShipmentFilters } from './reports.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { ShipmentStatus } from 'src/shipments/enums/shipment-status.enum';

@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** Admin & Employee: full shipment list with filters. Customer: own shipments only. */
  @Get('shipments')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  getShipments(
    @Query('status') status?: string,
    @Query('officeId') officeId?: string,
    @Query('senderId') senderId?: string,
    @Query('receiverId') receiverId?: string,
    @Request() req?: any,
  ) {
    const filters: ShipmentFilters = {
      status: status as ShipmentStatus | undefined,
      officeId: officeId ? +officeId : undefined,
      senderId: senderId ? +senderId : undefined,
      receiverId: receiverId ? +receiverId : undefined,
    };

    if (req?.user?.roleId === 3) {
      return this.reportsService.getCustomerShipments(req.user.sub, filters);
    }
    return this.reportsService.getShipments(filters);
  }

  /** Admin & Employee: office revenue breakdown. */
  @Get('office-revenue')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  getOfficeRevenue() {
    return this.reportsService.getOfficeRevenue();
  }

  /** Admin only: company-level revenue rollup. */
  @Get('company-revenue')
  @Roles(UserRoles.ADMIN)
  getCompanyRevenue() {
    return this.reportsService.getCompanyRevenue();
  }

  /** Admin & Employee: customer list with shipment counts. */
  @Get('customers')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  getCustomers() {
    return this.reportsService.getCustomers();
  }

  /** Admin & Employee: employee list. */
  @Get('employees')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  getEmployees() {
    return this.reportsService.getEmployees();
  }
}
