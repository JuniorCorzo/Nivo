import type { RegisterUserModel } from "./user.model";

export interface LoginResponseModel {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterTenant {
  companyName: string;
  user: RegisterUserModel;
}
