import type { RegisterUserModel } from "./user.model";

export interface TenantInfoModel {
  id: string;
  companyName: string;
}

export interface RegisterTenant {
  companyName: string;
  user: RegisterUserModel;
}
