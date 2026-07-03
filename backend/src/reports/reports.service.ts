import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from 'src/shipments/entities/shipment.entity';
import { Office } from 'src/company/entities/office.entity';
import { Company } from 'src/company/entities/company.entity';
import { Customer } from 'src/users/entities/customer.entity';
import { Employee } from 'src/users/entities/employee.entity';
import { ShipmentStatus } from 'src/shipments/enums/shipment-status.enum';

export interface ShipmentFilters {
  status?: ShipmentStatus;
  officeId?: number;
  senderId?: number;
  receiverId?: number;
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

  async getShipments(filters: ShipmentFilters): Promise<Shipment[]> {
    const where: Record<string, unknown> = {};
    if (filters.status) where['status'] = filters.status;
    if (filters.officeId) where['officeId'] = filters.officeId;
    if (filters.senderId) where['senderId'] = filters.senderId;
    if (filters.receiverId) where['receiverId'] = filters.receiverId;
    return this.shipmentRepo.find({ where, relations: ['sender', 'receiver', 'office'] });
  }

  async getCustomerShipments(userId: number, filters: ShipmentFilters): Promise<Shipment[]> {
    const customer = await this.customerRepo.findOne({ where: { userId } });
    if (!customer) return [];
    const where: Record<string, unknown> = { senderId: customer.id };
    if (filters.status) where['status'] = filters.status;
    return this.shipmentRepo.find({ where, relations: ['sender', 'receiver', 'office'] });
  }

  async getOfficeRevenue(): Promise<OfficeRevenueItem[]> {
    const offices = await this.officeRepo.find({ relations: ['company'] });
    const result: OfficeRevenueItem[] = [];

    for (const office of offices) {
      const shipments = await this.shipmentRepo.find({ where: { officeId: office.id } });
      const revenue = shipments.reduce((sum, s) => sum + Number(s.orderPriceSnapshot ?? 0), 0);
      result.push({
        officeId: office.id,
        officeName: office.name,
        companyId: office.company?.id ?? 0,
        companyName: office.company?.name ?? '',
        shipmentCount: shipments.length,
        revenue,
      });
    }

    return result;
  }

  async getCompanyRevenue(): Promise<CompanyRevenueItem[]> {
    const officeRevenues = await this.getOfficeRevenue();
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
      const [sent, received] = await Promise.all([
        this.shipmentRepo.count({ where: { senderId: c.id } }),
        this.shipmentRepo.count({ where: { receiverId: c.id } }),
      ]);
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
      jobTitle: e.jobTitle ?? null,
      department: e.department ?? null,
      companyName: e.company?.name ?? '',
    }));
  }
}
