import { ShipmentStatus } from "../utils/shipment-status.enum";
import { DeliveryMode } from "../utils/delivery-mode.enum";

export interface Company {
  id: number;
  name: string;
  address?: string;
  offices?: Office[];
}

export interface Office {
  id: number;
  name: string;
  location: string;
  officeSurcharge: number;
  addressSurcharge: number;
  pricePerKg: number;
  companyId?: number;
  company?: Company;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  userId: number;
  companyId?: number;
  company?: Company;
  user?: { id: number; username: string; email: string; roleId: number };
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  employeeType?: 'courier' | 'office_staff';
  phone?: string;
  department?: string;
  jobTitle?: string;
  employeeId?: string;
  userId: number;
  companyId?: number;
  officeId?: number;
  company?: Company;
  office?: Office;
  user?: { id: number; username: string; email: string; roleId: number };
}

export interface Shipment {
  id: number;
  senderId?: number;
  receiverCustomerId?: number;
  officeId?: number;
  sender?: Customer;
  receiverCustomer?: Customer;
  office?: Office;
  receiverName?: string;
  deliveryMode: DeliveryMode;
  weight: number;
  status: ShipmentStatus;
  trackingNumber: string;
  description?: string;
  priceSnapshot?: number;
  createdAt?: string;
  creatorId?: number;
  creatorRole?: number;
  deliveredAddress?: string;
  deliveredCity?: string;
  deliveredZip?: string;
  deliveredCountry?: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
}
