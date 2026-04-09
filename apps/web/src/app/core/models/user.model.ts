import { Role } from '../type/role.type';
import { BaseModel } from './base.model';
import { TenantInfoModel } from './tenants.model';

export type UserModel = BaseModel & {
  fullName: string;
  tenant: TenantInfoModel;
  role: Role;
  contactInfo: string;
  email: string;
};

export type UserCredentialsModel = {
  email: string;
  password: string;
};

export type RegisterUserModel = {
  fullName: string;
  email: string;
  contactInfo: string;
  password: string;
};
