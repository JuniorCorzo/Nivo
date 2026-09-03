import type { BaseModel } from "@core/models/base.model";
import type { Address } from "@core/type/address.type";
import type { Coordinates } from "@core/type/coordinates.type";
import type { OperatingHours } from "@core/type/operating-hours.type";
import type { SlotDistribution } from "@core/type/slot-distribution.type";

import type { TenantInfoModel } from "./tenants.model";
import type { UserInfoModel } from "./user.model";

export type ParkingLotsModel = BaseModel & {
  name: string;
  address: Address;
  coordinates: Coordinates;
  currency: string;
  timezone: string;
  operatingHours: OperatingHours;
  owner: UserInfoModel;
  tenant: TenantInfoModel;
};

export interface ParkingLotListItemModel {
  address: Address;
  coordinates: Coordinates;
  createdAt: string;
  currency: string;
  id: string;
  name: string;
  occuppationRate: number;
  ownerName: string;
  slotDistribution: SlotDistribution[];
  totalCapacity: number;
  updatedAt: string;
  operatingHours?: OperatingHours;
}

export interface UpsertParkingLotsModel {
  id?: string;
  name: string;
  coordinates: Coordinates;
  address: Address;
  currency: string;
  timezone: string;
  operatingHours: OperatingHours;
  slots?: SlotDistribution[];
}
