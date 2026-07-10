import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Shipment } from 'src/shipments/entities/shipment.entity';
import { Office } from 'src/company/entities/office.entity';
import { Company } from 'src/company/entities/company.entity';
import { Customer } from 'src/users/entities/customer.entity';
import { Employee } from 'src/users/entities/employee.entity';
import { ShipmentStatus } from 'src/shipments/enums/shipment-status.enum';
import { EmployeeType } from 'src/users/enums/employee-type.enum';

export interface ShipmentFilters {
  status?: ShipmentStatus;
  officeId?: number;
  senderId?: number;
}

export interface OfficeRevenueItem {
  officeId: number;
  officeName: string;
  companyId: number;
  companyName: string;
  shipmentCount: number;
  revenue: number;
}

export interface CompanyRevenueItem {
  companyId: number;
  companyName: string;
  officeCount: number;
  totalRevenue: number;
}

export interface RevenuePeriodFilters {
  from?: Date;
  to?: Date;
}

export interface CustomerReportItem {
  customerId: number;
  firstName: string;
  lastName: string;
  companyName: string | null;
  sentCount: number;
  receivedCount: number;
}

export interface EmployeeReportItem {
  employeeId: number;
  firstName: string;
  lastName: string;
  employeeType: EmployeeType;
  jobTitle: string | null;
  department: string | null;
  companyName: string;
}

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Shipment) private shipmentRepo: Repository<Shipment>,
    @InjectRepository(Office) private officeRepo: Repository<Office>,
    @InjectRepository(Company) private companyRepo: Repository<Company>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Employee) private employeeRepo: Repository<Employee>,
  ) {}

  private readonly shipmentRelations = ['sender', 'receiverCustomer', 'office'];

  private matchesRevenuePeriod(shipment: Shipment, filters?: RevenuePeriodFilters): boolean {
    if (!filters?.from && !filters?.to) {
      return true;
    }

    const createdAt = shipment.createdAt ? new Date(shipment.createdAt) : null;
    if (!createdAt) {
      return false;
    }
    if (filters.from && createdAt < filters.from) {
      return false;
    }
    if (filters.to && createdAt > filters.to) {
      return false;
    }
    return true;
  }

  async getShipments(filters: ShipmentFilters): Promise<Shipment[]> {
    const where: Record<string, unknown> = {};
    if (filters.status) where['status'] = filters.status;
    if (filters.officeId) where['officeId'] = filters.officeId;
    if (filters.senderId) where['senderId'] = filters.senderId;
    return this.shipmentRepo.find({ where, relations: this.shipmentRelations });
  }

  async getCustomerShipments(userId: number, filters: ShipmentFilters): Promise<Shipment[]> {
    const customer = await this.customerRepo.findOne({ where: { userId } });
    if (!customer) return [];
    const baseFilter: Partial<Pick<Shipment, 'status'>> = {};
    if (filters.status) baseFilter.status = filters.status;
    const where: FindOptionsWhere<Shipment>[] = [
      { ...baseFilter, senderId: customer.id },
      { ...baseFilter, receiverCustomerId: customer.id },
    ];
    return this.shipmentRepo.find({ where, relations: this.shipmentRelations });
  }

  async getShipmentsRegisteredByEmployee(employeeId: number): Promise<Shipment[]> {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
    if (!employee) return [];

    return this.shipmentRepo.find({
      where: { creatorId: employee.userId, creatorRole: 2 },
      relations: this.shipmentRelations,
    });
  }

  async getSentButNotReceivedShipments(): Promise<Shipment[]> {
    const shipments = await this.shipmentRepo.find({ relations: this.shipmentRelations });
    return shipments.filter(
      shipment => shipment.status !== ShipmentStatus.DELIVERED && shipment.status !== ShipmentStatus.CANCELLED,
    );
  }

  async getShipmentsSentByCustomer(customerId: number): Promise<Shipment[]> {
    return this.shipmentRepo.find({
      where: { senderId: customerId },
      relations: this.shipmentRelations,
    });
  }

  async getShipmentsReceivedByCustomer(customerId: number): Promise<Shipment[]> {
    return this.shipmentRepo.find({
      where: { receiverCustomerId: customerId },
      relations: this.shipmentRelations,
    });
  }

  async getOfficeRevenue(filters?: RevenuePeriodFilters): Promise<OfficeRevenueItem[]> {
    const offices = await this.officeRepo.find({ relations: ['company'] });
    const result: OfficeRevenueItem[] = [];

    for (const office of offices) {
      const shipments = await this.shipmentRepo.find({ where: { officeId: office.id } });
      const filteredShipments = shipments.filter(shipment => this.matchesRevenuePeriod(shipment, filters));
      const revenue = filteredShipments.reduce((sum, s) => sum + Number(s.priceSnapshot ?? 0), 0);
      result.push({
        officeId: office.id,
        officeName: office.name,
        companyId: office.company?.id ?? 0,
        companyName: office.company?.name ?? '',
        shipmentCount: filteredShipments.length,
        revenue,
      });
    }

    return result;
  }

  async getCompanyRevenue(filters?: RevenuePeriodFilters): Promise<CompanyRevenueItem[]> {
    const officeRevenues = await this.getOfficeRevenue(filters);
    const companyMap = new Map<number, CompanyRevenueItem>();

    for (const or of officeRevenues) {
      const existing = companyMap.get(or.companyId);
      if (existing) {
        existing.officeCount += 1;
        existing.totalRevenue += or.revenue;
      } else {
        companyMap.set(or.companyId, {
          companyId: or.companyId,
          companyName: or.companyName,
          officeCount: 1,
          totalRevenue: or.revenue,
        });
      }
    }

    return Array.from(companyMap.values());
  }

  async getCustomers(): Promise<CustomerReportItem[]> {
    const customers = await this.customerRepo.find({ relations: ['company'] });
    const result: CustomerReportItem[] = [];

    for (const c of customers) {
      const sent = await this.shipmentRepo.count({ where: { senderId: c.id } });
      const received = await this.shipmentRepo.count({ where: { receiverCustomerId: c.id } });
      result.push({
        customerId: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        companyName: c.company?.name ?? null,
        sentCount: sent,
	        receivedCount: received,
      });
    }

    return result;
  }

  async getEmployees(): Promise<EmployeeReportItem[]> {
    const employees = await this.employeeRepo.find({ relations: ['company'] });
    return employees.map(e => ({
      employeeId: e.id,
      firstName: e.firstName,
      lastName: e.lastName,
      employeeType: e.employeeType,
      jobTitle: e.jobTitle ?? null,
      department: e.department ?? null,
      companyName: e.company?.name ?? '',
    }));
  }
}
