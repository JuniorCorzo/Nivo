import { inject, Injectable } from '@angular/core';
import { RegisterTenantDto } from '@core/api/generated/models';
import { RegisterTenant, TenantInfoModel } from '@core/models/tenants.model';
import { UserMapper } from './user.mapper';

@Injectable({
  providedIn: 'root',
})
export class TenantMapper {
  private userMapper = inject(UserMapper);

  mapToTenantInfoModel(data: any): TenantInfoModel {
    return {
      id: data.id,
      companyName: data.companyName,
    };
  }

  mapToRegisterTenantDto(model: RegisterTenant): RegisterTenantDto {
    return {
      companyName: model.companyName,
      user: this.userMapper.mapToCreatedRegisterDto(model.user),
    };
  }
}
