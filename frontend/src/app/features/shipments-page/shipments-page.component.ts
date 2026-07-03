import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Observable } from 'rxjs';
import { Shipment } from '../../models/domain.models';
import { ShipmentsApiService } from '../../shared/services/shipments-api.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-shipments-page',
  standalone: true,
  imports: [NgFor, NgIf, AsyncPipe, ReactiveFormsModule],
  templateUrl: './shipments-page.component.html',
})
export class ShipmentsPageComponent implements OnInit {
  private readonly shipmentsApi = inject(ShipmentsApiService);
  private readonly fb = inject(FormBuilder);

  shipments$!: Observable<Shipment[]>;
  feedbackMessage = '';
  feedbackType: 'success' | 'error' | '' = '';
  readonly shipmentForm = this.fb.group({
    senderId: [null as number | null],
    receiverId: [null as number | null],
    officeId: [null as number | null],
    weight: [0, [Validators.required, Validators.min(0.1)]],
    description: [''],
  });

  ngOnInit(): void {
    this.reload();
  }

  createShipment(): void {
    if (this.shipmentForm.invalid) {
      return;
    }

    const value = this.shipmentForm.getRawValue();
    this.shipmentsApi.createShipment({
      senderId: value.senderId ?? undefined,
      receiverId: value.receiverId ?? undefined,
      officeId: value.officeId ?? undefined,
      weight: Number(value.weight),
      description: value.description ?? undefined,
    }).subscribe(() => {
      this.shipmentForm.reset({ senderId: null, receiverId: null, officeId: null, weight: 0, description: '' });
      this.setFeedback('Shipment created successfully.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to create shipment.', 'error');
    });
  }

  markInTransit(id: number): void {
    this.shipmentsApi.markInTransit(id).subscribe(() => {
      this.setFeedback('Shipment moved to in transit.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to mark shipment in transit.', 'error');
    });
  }

  markDelivered(id: number): void {
    this.shipmentsApi.markDelivered(id).subscribe(() => {
      this.setFeedback('Shipment marked as delivered.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to mark shipment delivered.', 'error');
    });
  }

  cancel(id: number): void {
    this.shipmentsApi.cancel(id).subscribe(() => {
      this.setFeedback('Shipment cancelled.', 'success');
      this.reload();
    }, () => {
      this.setFeedback('Failed to cancel shipment.', 'error');
    });
  }

  private setFeedback(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
  }

  private reload(): void {
    this.shipments$ = this.shipmentsApi.getShipments();
  }
}
