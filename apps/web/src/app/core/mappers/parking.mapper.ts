import type {
  CreatedSlots,
  SlotDistributionResponse,
} from "@core/api/generated/models";
import type { ParkingLotListItemResponse } from "@core/api/generated/models/parking-lot-list-item-response";
import type { ParkingLotsResponse } from "@core/api/generated/models/parking-lots-response";
import type { UpsertParkingLotsRequest } from "@core/api/generated/models/upsert-parking-lots-request";
import type {
  ParkingLotListItemModel,
  ParkingLotsModel,
  UpsertParkingLotsModel,
} from "@core/models/parking.model";
import type {
  SlotDistribution,
  SlotType,
} from "@core/type/slot-distribution.type";

const mapToSlotDistributionModel = (
  response: SlotDistributionResponse
): SlotDistribution => {
  /* SAFETY: Backend returns valid SlotType string value corresponding to the enum */
  const type = response.type as SlotType;
  return { ...response, type };
};

const mapToCreatedSlot = (model: SlotDistribution): CreatedSlots => ({
  numberSlots: model.count,
  prefix: model.prefix,
  slotType: model.type,
  zone: model.zone,
});

export const mapToParkingLotsModel = (
  response: ParkingLotsResponse
): ParkingLotsModel => ({
  address: response.address,
  coordinates: response.coordinates,
  createdAt: new Date(response.createdAt),
  currency: response.currency,
  id: response.id,
  name: response.name,
  operatingHours: response.operatingHours,
  owner: response.owner,
  tenant: response.tenant,
  timezone: response.timezone,
  updatedAt: new Date(response.updatedAt),
});

export const mapToParkingLotListItemModel = (
  response: ParkingLotListItemResponse
): ParkingLotListItemModel => ({
  address: response.address,
  coordinates: response.coordinates,
  createdAt: response.createdAt,
  currency: response.currency,
  id: response.id,
  name: response.name,
  occuppationRate: response.occuppationRate,
  operatingHours: response.operatingHours,
  ownerName: response.ownerName,
  slotDistribution: response.slotDistribution.map((slot) =>
    mapToSlotDistributionModel(slot)
  ),
  totalCapacity: response.totalCapacity,
  updatedAt: response.updatedAt,
});

export const mapListItemToUpsertParkingLotsModel = (
  model: ParkingLotListItemModel
): UpsertParkingLotsModel => ({
  address: {
    ...model.address,
    country: model.address.country || "Colombia",
  },
  coordinates: model.coordinates,
  currency: model.currency || "COP",
  id: model.id,
  name: model.name,
  operatingHours: {
    closeTime: model.operatingHours?.closeTime ?? "",
    openTime: model.operatingHours?.openTime ?? "",
  },
  slots: model.slotDistribution.map((slot) => ({
    count: slot.count ?? 0,
    prefix: slot.prefix ?? "",
    type: slot.type,
    zone: slot.zone ?? "",
  })),
  timezone: "UTC-05:00",
});

export const mapToUpsertParkingLotsRequest = (
  model: UpsertParkingLotsModel
): UpsertParkingLotsRequest => ({
  address: model.address,
  coordinates: model.coordinates,
  currency: model.currency,
  id: model.id,
  name: model.name,
  operatingHours: model.operatingHours,
  slots: model.slots?.map((slot) => mapToCreatedSlot(slot)),
  timezone: model.timezone,
});
