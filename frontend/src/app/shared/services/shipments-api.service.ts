import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Shipment } from '../../models/domain.models';

@Injectable({ providedIn: 'root' })
export class ShipmentsApiService {
  constructor(private readonly http: HttpClient) {}

  public getShipments(): Observable<Shipment[]> {
    return this.http.get<Shipment[]>('/api/shipments');
  }

  public createShipment(payload: {
    senderId?: number;
    receiverId?: number;
    officeId?: number;
    weight: number;
    description?: string;
  }): Observable<Shipment> {
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

  public getShipmentByTracking(trackingNumber: string): Observable<Shipment | null> {
    return this.http.get<Shipment | null>(`/api/shipments/tracking/${trackingNumber}`);
  }
}
