import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, Shipment } from '../../models/domain.models';
import { DeliveryMode } from '../../utils/delivery-mode.enum';

export interface CreateShipmentPayload {
  receiverName: string;
  deliveryMode: DeliveryMode;
  weight: number;
  officeId?: number;
  senderCustomerId?: number;
  description?: string;
  deliveredAddress?: string;
  deliveredCity?: string;
  deliveredZip?: string;
  deliveredCountry?: string;
}

@Injectable({ providedIn: 'root' })
export class ShipmentsApiService {
  constructor(private readonly http: HttpClient) {}

  public getShipments(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>('/api/shipments');
  }

  public createShipment(payload: CreateShipmentPayload): Observable<Shipment> {
    return this.http.post<Shipment>('/api/shipments', payload);
  }

  public markInTransit(id: number): Observable<Shipment> {
    return this.http.patch<Shipment>(`/api/shipments/${id}/mark-in-transit`, {});
  }

  public markDelivered(id: number): Observable<Shipment> {
    return this.http.patch<Shipment>(`/api/shipments/${id}/mark-delivered`, {});
  }

  public cancel(id: number): Observable<Shipment> {
    return this.http.patch<Shipment>(`/api/shipments/${id}/cancel`, {});
  }

  public getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>('/api/customers');
  }
}
