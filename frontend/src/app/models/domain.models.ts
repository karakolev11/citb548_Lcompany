import { ShipmentStatus } from "../utils/shipment-status.enum";

export interface Company {
  id: number;
  name: string;
}

export interface Office {
  id: number;
  name: string;
  location: string;
  orderPrice: number;
  company?: Company;
}

export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  userId: number;
  companyId?: number;
}

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  userId: number;
  companyId: number;
}

export interface Shipment {
  id: number;
  senderId?: number;
  receiverId?: number;
  officeId?: number;
  sender?: Customer;
  receiver?: Customer;
  office?: Office;
  weight: number;
  status: ShipmentStatus;
  trackingNumber: string;
  description?: string;
  orderPriceSnapshot?: number;
}
