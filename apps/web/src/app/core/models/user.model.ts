import type { Role } from "../type/role.type";
import type { BaseModel } from "./base.model";
import type { TenantInfoModel } from "./tenants.model";

export type UserModel = BaseModel & {
  contactInfo: string;
  deletedAt?: Date | null;
  deletedBy?: string | null;
  email: string;
  fullName: string;
  role: Role;
  tenant: TenantInfoModel;
};

export interface UserInfoModel {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  contactInfo: string;
}

export interface UserCredentialsModel {
  email: string;
  password: string;
}

export interface RegisterUserModel {
  fullName: string;
  email: string;
  contactInfo: string;
  password: string;
}
