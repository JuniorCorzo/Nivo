import { BaseModel } from '@core/models/base.model';
import { Address } from '@core/type/address.type';
import { OperatingHours } from '@core/type/operating-hours.type';
import { CreatedSlot } from '@core/type/slot.type';
import { UserInfoModel } from './user.model';
import { TenantInfoModel } from './tenants.model';

export type ParkingLotsModel = BaseModel & {
  name: string;
  address: Address;
  currency: string;
  timezone: string;
  operatingHours: OperatingHours;
  owner: UserInfoModel;
  tenant: TenantInfoModel;
};

export type UpsertParkingLotsModel = {
  id?: string;
  name: string;
  address: Address;
  currency: string;
  timezone: string;
  operatingHours: OperatingHours;
  slots?: CreatedSlot[];
};
