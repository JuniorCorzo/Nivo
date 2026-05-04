import { BaseModel } from '@core/models/base.model';
import { Address } from '@core/type/address.type';
import { OperatingHours } from '@core/type/operating-hours.type';
import { UserInfoModel } from './user.model';
import { TenantInfoModel } from './tenants.model';
import { Coordinates } from '@core/type/coordinates.type';
import { SlotDistribution } from '@core/type/slot-distribution.type';

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

export type ParkingLotListItemModel = {
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
};

export type UpsertParkingLotsModel = {
  id?: string;
  name: string;
  coordinates: Coordinates;
  address: Address;
  currency: string;
  timezone: string;
  operatingHours: OperatingHours;
  slots?: SlotDistribution[];
};
