import { HttpContext } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import type {
  ResponseListParkingLotListItemResponse,
  ResponseParkingLotsResponse,
} from "@core/api/generated/models";
import { ParkingLotsService } from "@core/api/generated/services/parking-lots.service";
import { AUTHORIZED } from "@core/http/context/auth.token";
import {
  mapListItemToUpsertParkingLotsModel,
  mapToParkingLotListItemModel,
  mapToParkingLotsModel,
  mapToUpsertParkingLotsRequest,
} from "@core/mappers/parking.mapper";
import type {
  ParkingLotListItemModel,
  ParkingLotsModel,
  UpsertParkingLotsModel,
} from "@core/models/parking.model";
import type { SlotDistribution } from "@core/type/slot-distribution.type";
import type { Observable } from "rxjs";
import { map, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class ParkingService {
  private _parkingLots = signal<ParkingLotListItemModel[]>([]);
  public parkingLots = this._parkingLots.asReadonly();

  private parkingLotsService = inject(ParkingLotsService);

  private static httpContext() {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  }

  constructor() {
    this.updateState();
  }

  private updateState() {
    this.getAll().subscribe((parkintLotsResponse) =>
      this._parkingLots.set(parkintLotsResponse)
    );
  }

  /**
   * Get all parking lots
   */
  getAll(): Observable<ParkingLotListItemModel[]> {
    return this.parkingLotsService
      .listParkingLots({}, ParkingService.httpContext())
      .pipe(
        map((response: ResponseListParkingLotListItemResponse) =>
          response.data.map((item) => mapToParkingLotListItemModel(item))
        )
      );
  }

  /**
   * Get a parking lot by ID
   * Note: API doesn't have a direct endpoint, so we filter from the list
   */
  getById(id: string): Observable<ParkingLotListItemModel> {
    return this.getAll().pipe(
      map((parkingLots) => {
        const parking = parkingLots.find((p) => p.id === id);
        if (!parking) {
          throw new Error(`Parking lot with ID ${id} not found`);
        }
        return parking;
      })
    );
  }

  /**
   * Create a new parking lot
   */
  create(model: UpsertParkingLotsModel): Observable<ParkingLotsModel> {
    const request = mapToUpsertParkingLotsRequest(model);

    return this.parkingLotsService
      .createParkingLots({ body: request }, ParkingService.httpContext())
      .pipe(
        map((response: ResponseParkingLotsResponse) =>
          mapToParkingLotsModel(response.data)
        ),
        tap(() => this.updateState())
      );
  }

  /**
   * Update an existing parking lot
   */
  update(model: UpsertParkingLotsModel): Observable<ParkingLotsModel> {
    const request = mapToUpsertParkingLotsRequest(model);

    return this.parkingLotsService
      .updateParkingLots({ body: request }, ParkingService.httpContext())
      .pipe(
        map((response: ResponseParkingLotsResponse) =>
          mapToParkingLotsModel(response.data)
        ),
        tap(() => this.updateState())
      );
  }

  deleteSlotGroup(parkingId: string, slot: SlotDistribution): Observable<void> {
    return this.parkingLotsService
      .deleteSlotGroup(
        {
          parkingId,
          prefix: slot.prefix || undefined,
          slotType: slot.type,
          zone: slot.zone || undefined,
        },
        ParkingService.httpContext()
      )
      .pipe(
        map(() => {
          // void return
        })
      );
  }

  /**
   * Delete a parking lot by ID
   */
  delete(id: string): Observable<void> {
    return this.parkingLotsService
      .deleteParkingLot({ parkingId: id }, ParkingService.httpContext())
      .pipe(
        tap(() => this.updateState()),
        map(() => {
          // void return
        })
      );
  }

  getUpsertById(id: string): Observable<UpsertParkingLotsModel> {
    return this.getById(id).pipe(
      map((parking) => mapListItemToUpsertParkingLotsModel(parking))
    );
  }
}
