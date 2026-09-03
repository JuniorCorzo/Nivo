import { HttpContext } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import type {
  ResponseListSlotSummaryResponse,
  ResponseSlotResponse,
  SlotResponse,
  SlotSummaryResponse,
} from "@core/api/generated/models";
import { SlotsService } from "@core/api/generated/services";
import { AUTHORIZED } from "@core/http/context/auth.token";
import type {
  SlotModel,
  SlotSummary,
  UpsertSlotModel,
  BatchCreateSlotModel,
} from "@core/models/slot.model";
import type { Observable } from "rxjs";
import { Subject } from "rxjs";
import { map, tap } from "rxjs/operators";

/**
 * Pure function: maps API SlotSummaryResponse to web SlotSummary model.
 */
export const mapToSlotSummary = (data: SlotSummaryResponse): SlotSummary => ({
  hasHistory: data.hasHistory ?? false,
  hasTicket: data.hasTicket ?? false,
  id: data.id ?? "",
  parkingName: data.parkingName ?? "",
  prefix: data.prefix ?? "",
  slotNumber: data.numberSlot ?? "",
  status: data.status ?? "AVAILABLE",
  type: data.type ?? "CAR",
  zone: data.zone ?? "",
});

@Injectable({
  providedIn: "root",
})
export class SlotService {
  private readonly deleteSubject = new Subject<string>();
  public readonly delete$ = this.deleteSubject.asObservable();
  private readonly slotSummaries = signal<Record<string, SlotSummary[]>>({});
  readonly summaries = this.slotSummaries.asReadonly();

  private slotsService = inject(SlotsService);

  private static httpContext() {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  }

  getAllSlotSummariesByParkingId(parkingId: string): Observable<SlotSummary[]> {
    return this.slotsService
      .listSlotSummaries({ parking: parkingId }, SlotService.httpContext())
      .pipe(
        map((response: ResponseListSlotSummaryResponse) =>
          (response.data ?? []).map((item) => mapToSlotSummary(item))
        ),
        tap((slots) =>
          this.slotSummaries.update((state) => ({
            ...state,
            [parkingId]: slots,
          }))
        )
      );
  }

  create(model: BatchCreateSlotModel): Observable<void> {
    return this.createBatch(model);
  }

  createBatch(model: BatchCreateSlotModel): Observable<void> {
    return this.slotsService
      .createSlots(
        {
          body: {
            parkingLotId: model.parkingLotId,
            slots: model.slots.map((s) => ({
              numberSlots: s.numberSlots,
              prefix: s.prefix,
              slotType: s.slotType,
              zone: s.zone,
            })),
          },
        },
        SlotService.httpContext()
      )
      .pipe(
        map(() => {
          // void return
        }),
        tap(() => this.refreshState(model.parkingLotId))
      );
  }

  update(model: UpsertSlotModel): Observable<SlotModel> {
    return this.slotsService
      .updateSlot(
        {
          body: {
            id: model.id ?? "",
            slotNumber: model.slotNumber,
            status: model.status,
            type: model.type,
          },
        },
        SlotService.httpContext()
      )
      .pipe(
        map((response: ResponseSlotResponse) => {
          /* SAFETY: Response data for updateSlot is defined */
          const data = response.data as SlotResponse;
          return SlotService.mapToSlotModel(data);
        }),
        tap(() => this.refreshState(model.parkingLotId))
      );
  }

  delete(slotId: string, parkingId: string): Observable<void> {
    return this.slotsService
      .deleteSlot({ slotId }, SlotService.httpContext())
      .pipe(
        map(() => {
          // void return
        }),
        tap(() => this.refreshState(parkingId))
      );
  }

  deleteBatch(slotIds: string[], parkingId: string): Observable<void> {
    return this.slotsService
      .batchDelete(
        {
          body: slotIds,
        },
        SlotService.httpContext()
      )
      .pipe(
        map(() => {
          // void return
        }),
        tap(() => this.refreshState(parkingId))
      );
  }

  requestDelete(id: string): void {
    this.deleteSubject.next(id);
  }

  private refreshState(parkingId: string): void {
    this.getAllSlotSummariesByParkingId(parkingId).subscribe();
  }

  private static mapToSlotModel(data: SlotResponse): SlotModel {
    return {
      createdAt: data.createdAt ?? "",
      id: data.id ?? "",
      parkingId: data.parking?.id ?? "",
      slotNumber: data.slotNumber ?? "",
      status: data.status ?? "AVAILABLE",
      type: data.type ?? "CAR",
      updatedAt: data.updatedAt ?? "",
    };
  }
}
