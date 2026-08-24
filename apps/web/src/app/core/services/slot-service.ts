import { inject, Injectable, signal } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { SlotsControllerService } from '@core/api/generated/services/slots-controller.service';
import {
  ResponseListSlotSummaryResponse,
  ResponseSlotResponse,
  SlotResponse,
  SlotSummaryResponse,
} from '@core/api/generated/models';
import { SlotModel, SlotSummary, UpsertSlotModel, BatchCreateSlotModel } from '@core/models/slot.model';
import { HttpContext } from '@angular/common/http';
import { AUTHORIZED } from '@core/http/context/auth.token';

/**
 * Pure function: maps API SlotSummaryResponse to web SlotSummary model.
 */
export function mapToSlotSummary(data: SlotSummaryResponse): SlotSummary {
  return {
    id: data.id ?? '',
    parkingName: data.parkingName ?? '',
    slotNumber: data.numberSlot ?? '',
    prefix: data.prefix ?? '',
    zone: data.zone ?? '',
    type: data.type ?? 'CAR',
    status: data.status ?? 'AVAILABLE',
    hasTicket: data.hasTicket ?? false,
    hasHistory: data.hasHistory ?? false,
  };
}

@Injectable({
  providedIn: 'root',
})
export class SlotService {
  private readonly deleteSubject = new Subject<string>();
  public readonly delete$ = this.deleteSubject.asObservable();
  private readonly slotSummaries = signal<Record<string, SlotSummary[]>>({});
  readonly summaries = this.slotSummaries.asReadonly();

  private slotsControllerService = inject(SlotsControllerService);

  private httpContext = () => {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  };

  getAllSlotSummariesByParkingId(parkingId: string): Observable<SlotSummary[]> {
    return this.slotsControllerService
      .listSlotSummaries({ parking: parkingId }, this.httpContext())
      .pipe(
        map((response: ResponseListSlotSummaryResponse) =>
          (response.data ?? []).map((item) => mapToSlotSummary(item)),
        ),
        tap((slots) =>
          this.slotSummaries.update((state) => ({
            ...state,
            [parkingId]: slots,
          })),
        ),
        catchError((error) => throwError(() => error)),
      );
  }

  create(model: BatchCreateSlotModel): Observable<void> {
    return this.createBatch(model);
  }

  createBatch(model: BatchCreateSlotModel): Observable<void> {
    return this.slotsControllerService
      .createSlots(
        {
          body: {
            parkingLotId: model.parkingLotId,
            slots: model.slots.map((s) => ({
              prefix: s.prefix,
              zone: s.zone,
              slotType: s.slotType,
              numberSlots: s.numberSlots,
            })),
          },
        },
        this.httpContext(),
      )
      .pipe(
        map(() => void 0),
        tap(() => this.refreshState(model.parkingLotId)),
        catchError((error) => throwError(() => error)),
      );
  }

  update(model: UpsertSlotModel): Observable<SlotModel> {
    return this.slotsControllerService
      .updateSlot(
        {
          body: {
            id: model.id!,
            slotNumber: model.slotNumber,
            status: model.status,
            type: model.type,
          },
        },
        this.httpContext(),
      )
      .pipe(
        map((response: ResponseSlotResponse) => this.mapToSlotModel(response.data)),
        tap(() => this.refreshState(model.parkingLotId)),
        catchError((error) => throwError(() => error)),
      );
  }

  delete(slotId: string, parkingId: string): Observable<void> {
    return this.slotsControllerService.deleteSlot({ slotId }, this.httpContext()).pipe(
      map(() => void 0),
      tap(() => this.refreshState(parkingId)),
      catchError((error) => throwError(() => error)),
    );
  }

  deleteBatch(slotIds: string[], parkingId: string): Observable<void> {
    return this.slotsControllerService
      .batchDelete(
        {
          body: slotIds,
        },
        this.httpContext(),
      )
      .pipe(
        map(() => void 0),
        tap(() => this.refreshState(parkingId)),
        catchError((error) => throwError(() => error)),
      );
  }

  requestDelete(id: string): void {
    this.deleteSubject.next(id);
  }

  private refreshState(parkingId: string): void {
    this.getAllSlotSummariesByParkingId(parkingId).subscribe();
  }

  private mapToSlotModel(data: SlotResponse): SlotModel {
    return {
      id: data.id ?? '',
      slotNumber: data.slotNumber ?? '',
      status: data.status ?? 'AVAILABLE',
      type: data.type ?? 'CAR',
      parkingId: data.parking?.id ?? '',
      createdAt: data.createdAt ?? '',
      updatedAt: data.updatedAt ?? '',
    };
  }
}
