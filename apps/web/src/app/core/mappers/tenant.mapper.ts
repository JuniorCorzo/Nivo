import type { RegisterTenantDto } from "@core/api/generated/models";
import type {
  RegisterTenant,
  TenantInfoModel,
} from "@core/models/tenants.model";

import { mapToCreatedRegisterDto } from "./user.mapper";

export const mapToTenantInfoModel = (
  data: TenantInfoModel
): TenantInfoModel => ({
  companyName: data.companyName,
  id: data.id,
});

export const mapToRegisterTenantDto = (
  model: RegisterTenant
): RegisterTenantDto => ({
  companyName: model.companyName,
  user: mapToCreatedRegisterDto(model.user),
});
