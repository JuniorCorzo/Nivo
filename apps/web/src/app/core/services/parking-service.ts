import { inject, Injectable, signal } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ParkingLotsService } from '@core/api/generated/services/parking-lots.service';
import {
  ParkingLotListItemResponse,
  ResponseListParkingLotListItemResponse,
  ResponseParkingLotsResponse,
} from '@core/api/generated/models';
import {
  ParkingLotListItemModel,
  ParkingLotsModel,
  UpsertParkingLotsModel,
} from '@core/models/parking.model';
import { ParkingMapper } from '@core/mappers/parking.mapper';
import { HttpContext } from '@angular/common/http';
import { AUTHORIZED } from '@core/http/context/auth.token';

@Injectable({
  providedIn: 'root',
})
export class ParkingService {
  private _parkingLots = signal<ParkingLotListItemModel[]>([]);
  public parkingLots = this._parkingLots.asReadonly();

  private parkingLotsService = inject(ParkingLotsService);
  private parkingMapper = inject(ParkingMapper);

  private httpContext = () => {
    const context = new HttpContext();
    context.set(AUTHORIZED, true);
    return context;
  };

  constructor() {
    this.updateState();
  }

  private updateState() {
    this.getAll().subscribe((parkintLotsResponse) => this._parkingLots.set(parkintLotsResponse));
  }

  /**
   * Get all parking lots
   */
  getAll(): Observable<ParkingLotListItemModel[]> {
    return this.parkingLotsService.listParkingLots({}, this.httpContext()).pipe(
      map((response: ResponseListParkingLotListItemResponse) =>
        response.data.map((item) => this.parkingMapper.mapToParkingLotListItemModel(item)),
      ),
      catchError((error) => {
        console.error('Error fetching parking lots:', error);
        return throwError(() => error);
      }),
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
      }),
      catchError((error) => {
        console.error(`Error fetching parking lot with ID ${id}:`, error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Create a new parking lot
   */
  create(model: UpsertParkingLotsModel): Observable<ParkingLotsModel> {
    const request = this.parkingMapper.mapToUpsertParkingLotsRequest(model);

    return this.parkingLotsService.createParkingLots({ body: request }, this.httpContext()).pipe(
      map((response: ResponseParkingLotsResponse) =>
        this.parkingMapper.mapToParkingLotsModel(response.data),
      ),
      catchError((error) => {
        console.error('Error creating parking lot:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Update an existing parking lot
   */
  update(model: UpsertParkingLotsModel): Observable<ParkingLotsModel> {
    const request = this.parkingMapper.mapToUpsertParkingLotsRequest(model);

    return this.parkingLotsService.updateParkingLots({ body: request }, this.httpContext()).pipe(
      map((response: ResponseParkingLotsResponse) =>
        this.parkingMapper.mapToParkingLotsModel(response.data),
      ),
      catchError((error) => {
        console.error('Error updating parking lot:', error);
        return throwError(() => error);
      }),
    );
  }
}
