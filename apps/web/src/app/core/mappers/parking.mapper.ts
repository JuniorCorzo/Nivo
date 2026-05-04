import { Injectable } from '@angular/core';
import { CreatedSlots, SlotDistributionResponse } from '@core/api/generated/models';
import { ParkingLotListItemResponse } from '@core/api/generated/models/parking-lot-list-item-response';
import { ParkingLotsResponse } from '@core/api/generated/models/parking-lots-response';
import { UpsertParkingLotsRequest } from '@core/api/generated/models/upsert-parking-lots-request';
import {
  ParkingLotListItemModel,
  ParkingLotsModel,
  UpsertParkingLotsModel,
} from '@core/models/parking.model';
import { SlotDistribution, SlotType } from '@core/type/slot-distribution.type';

@Injectable({ providedIn: 'root' })
export class ParkingMapper {
  mapToParkingLotsModel(response: ParkingLotsResponse): ParkingLotsModel {
    return {
      id: response.id,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      name: response.name,
      address: response.address,
      coordinates: response.coordinates,
      currency: response.currency,
      timezone: response.timezone,
      operatingHours: response.operatingHours,
      owner: response.owner,
      tenant: response.tenant,
    };
  }

  mapToParkingLotListItemModel(response: ParkingLotListItemResponse): ParkingLotListItemModel {
    return {
      address: response.address,
      coordinates: response.coordinates,
      createdAt: response.createdAt,
      currency: response.currency,
      id: response.id,
      name: response.name,
      occuppationRate: response.occuppationRate,
      ownerName: response.ownerName,
      operatingHours: response.operatingHours,
      slotDistribution: response.slotDistribution.map((slot) =>
        this.mapToSlotDistributionModel(slot),
      ),
      totalCapacity: response.totalCapacity,
      updatedAt: response.updatedAt,
    };
  }

  mapListItemToUpsertParkingLotsModel(model: ParkingLotListItemModel): UpsertParkingLotsModel {
    return {
      id: model.id,
      name: model.name,
      address: {
        ...model.address,
        country: model.address.country || 'Colombia',
      },
      coordinates: model.coordinates,
      currency: model.currency || 'COP',
      timezone: 'UTC-05:00',
      operatingHours: {
        openTime: model.operatingHours?.openTime ?? '',
        closeTime: model.operatingHours?.closeTime ?? '',
      },
      slots: model.slotDistribution.map((slot) => ({
        prefix: slot.prefix ?? '',
        zone: slot.zone ?? '',
        type: slot.type,
        count: slot.count ?? 0,
      })),
    };
  }

  mapToUpsertParkingLotsRequest(model: UpsertParkingLotsModel): UpsertParkingLotsRequest {
    return {
      id: model.id,
      name: model.name,
      address: model.address,
      coordinates: model.coordinates,
      currency: model.currency,
      timezone: model.timezone,
      operatingHours: model.operatingHours,
      slots: model.slots?.map((slot) => this.mapToCreatedSlot(slot)),
    };
  }

  private mapToSlotDistributionModel(response: SlotDistributionResponse): SlotDistribution {
    return { ...response, type: response.type as SlotType };
  }

  private mapToCreatedSlot(model: SlotDistribution): CreatedSlots {
    return {
      prefix: model.prefix,
      zone: model.zone,
      numberSlots: model.count,
      slotType: model.type,
    };
  }
}
