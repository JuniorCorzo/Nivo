import { Injectable } from '@angular/core';
import { ParkingLotsResponse } from '@core/api/generated/models/parking-lots-response';
import { UpsertParkingLotsRequest } from '@core/api/generated/models/upsert-parking-lots-request';
import { ParkingLotsModel, UpsertParkingLotsModel } from '@core/models/parking.model';

@Injectable({ providedIn: 'root' })
export class ParkingMapper {
  mapToParkingLotsModel(response: ParkingLotsResponse): ParkingLotsModel {
    return {
      id: response.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      name: response.name,
      address: response.address,
      currency: response.currency,
      timezone: response.timezone,
      operatingHours: response.operatingHours,
      owner: response.owner,
      tenant: response.tenant,
    };
  }

  mapToUpsertParkingLotsRequest(model: UpsertParkingLotsModel): UpsertParkingLotsRequest {
    return {
      id: model.id,
      name: model.name,
      address: model.address,
      currency: model.currency,
      timezone: model.timezone,
      operatingHours: model.operatingHours,
      slots: model.slots,
    };
  }
}
