import { BaseModel } from './base.model';
import { RegisterUserModel } from './user.model';

export type TenantInfoModel = {
  id: string;
  companyName: string;
};

export type RegisterTenant = {
  companyName: string;
  user: RegisterUserModel;
};
