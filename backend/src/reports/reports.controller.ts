import { BadRequestException, Controller, Get, Param, Query, Request, UseGuards } from '@nestjs/common';
import { ReportsService, RevenuePeriodFilters, ShipmentFilters } from './reports.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RoleGuard } from 'src/auth/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRoles } from 'src/common/enums/user-roles.enum';
import { ShipmentStatus } from 'src/shipments/enums/shipment-status.enum';

@Controller('reports')
@UseGuards(AuthGuard, RoleGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private parseDateParam(value?: string, name?: string): Date | undefined {
    if (!value) return undefined;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException(`${name} must be a valid ISO date`);
    }
    return parsed;
  }

  private getRevenuePeriodFilters(from?: string, to?: string): RevenuePeriodFilters {
    return {
      from: this.parseDateParam(from, 'from'),
      to: this.parseDateParam(to, 'to'),
    };
  }

  /** Admin & Employee: full shipment list with filters. Customer: own shipments only. */
  @Get('shipments')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE, UserRoles.CUSTOMER)
  getShipments(
    @Query('status') status?: string,
    @Query('officeId') officeId?: string,
    @Query('senderId') senderId?: string,
    @Request() req?: any,
  ) {
    const filters: ShipmentFilters = {
      status: status as ShipmentStatus | undefined,
      officeId: officeId ? +officeId : undefined,
      senderId: senderId ? +senderId : undefined,
    };

    if (req?.user?.roleId === 3) {
      return this.reportsService.getCustomerShipments(req.user.sub, filters);
    }
    return this.reportsService.getShipments(filters);
  }

  /** Admin & Employee: shipments registered by a given employee. */
  @Get('shipments/by-employee/:employeeId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  getShipmentsByEmployee(@Param('employeeId') employeeId: string) {
    return this.reportsService.getShipmentsRegisteredByEmployee(+employeeId);
  }

  /** Admin & Employee: shipments that are not yet delivered and not cancelled. */
  @Get('shipments/sent-not-received')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  getSentButNotReceivedShipments() {
    return this.reportsService.getSentButNotReceivedShipments();
  }

  /** Admin & Employee: shipments sent by a given customer. */
  @Get('shipments/sent-by-customer/:customerId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  getShipmentsSentByCustomer(@Param('customerId') customerId: string) {
    return this.reportsService.getShipmentsSentByCustomer(+customerId);
  }

  /** Admin & Employee: shipments received by a given customer. */
  @Get('shipments/received-by-customer/:customerId')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  getShipmentsReceivedByCustomer(@Param('customerId') customerId: string) {
    return this.reportsService.getShipmentsReceivedByCustomer(+customerId);
  }

  /** Admin & Employee: office revenue breakdown. */
  @Get('office-revenue')
  @Roles(UserRoles.ADMIN, UserRoles.EMPLOYEE)
  getOfficeRevenue(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getOfficeRevenue(this.getRevenuePeriodFilters(from, to));
  }

  /** Admin only: company-level revenue rollup. */
  @Get('company-revenue')
  @Roles(UserRoles.ADMIN)
  getCompanyRevenue(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getCompanyRevenue(this.getRevenuePeriodFilters(from, to));
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
