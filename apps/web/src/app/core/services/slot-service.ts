import { HttpClient, HttpContext } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { ApiConfiguration } from "@core/api/generated/api-configuration";
import type {
  ResponseListSlotResponse,
  ResponseListSlotSummaryResponse,
  ResponseSlotResponse,
  SlotResponse,
  SlotSummaryResponse,
} from "@core/api/generated/models";
import { SlotsService } from "@core/api/generated/services";
import { AUTHORIZED } from "@core/http/context/auth.token";
import type {
  BatchCreateSlotModel,
  Slot,
  SlotModel,
  SlotSummary,
  UpsertSlotModel,
} from "@core/models/slot.model";
import type { Observable } from "rxjs";
import { Subject } from "rxjs";
import { map, tap } from "rxjs/operators";

/**
 * Pure function: maps API SlotSummaryResponse to web SlotSummary model.
 */
export const mapToSlotSummary = (data: SlotSummaryResponse): SlotSummary => ({
  hasCharger: data.hasCharger ?? false,
  hasHistory: data.hasHistory ?? false,
  hasTicket: data.hasTicket ?? false,
  id: data.id ?? "",
  isAccessible: data.isAccessible ?? false,
  isActive: data.isActive ?? true,
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
  private http = inject(HttpClient);
  private config = inject(ApiConfiguration);

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

  updateSlotMetadata(payload: {
    slotIds: string[];
    hasCharger?: boolean;
    isAccessible?: boolean;
    isActive?: boolean;
  }): Observable<Slot[]> {
    const rootUrl = this.config.rootUrl.replace(/\/+$/u, "");
    return this.http
      .patch<ResponseListSlotResponse>(`${rootUrl}/slots/metadata`, payload, {
        context: SlotService.httpContext(),
      })
      .pipe(
        map((response: ResponseListSlotResponse) =>
          (response.data ?? []).map((item) => SlotService.mapToSlotModel(item))
        ),
        tap((slots) => {
          if (slots.length > 0 && slots[0].parkingId) {
            this.refreshState(slots[0].parkingId);
          }
        })
      );
  }

  updateSlotGroup(payload: {
    parkingId: string;
    currentZone: string;
    currentPrefix: string;
    newZone?: string;
    newPrefix?: string;
  }): Observable<Slot[]> {
    const rootUrl = this.config.rootUrl.replace(/\/+$/u, "");
    return this.http
      .patch<ResponseListSlotResponse>(`${rootUrl}/slots/groups`, payload, {
        context: SlotService.httpContext(),
      })
      .pipe(
        map((response: ResponseListSlotResponse) =>
          (response.data ?? []).map((item) => SlotService.mapToSlotModel(item))
        ),
        tap(() => this.refreshState(payload.parkingId))
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

  private static mapToSlotModel(data: SlotResponse): Slot {
    return {
      createdAt: data.createdAt ?? "",
      hasCharger: data.hasCharger ?? false,
      id: data.id ?? "",
      isAccessible: data.isAccessible ?? false,
      isActive: data.isActive ?? true,
      parkingId: data.parking?.id ?? "",
      slotNumber: data.slotNumber ?? "",
      status: data.status ?? "AVAILABLE",
      type: data.type ?? "CAR",
      updatedAt: data.updatedAt ?? "",
    };
  }
}
