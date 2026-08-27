import { HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TenantsService } from '@core/api/generated/services';
import { AUTHORIZED } from '@core/http/context/auth.token';
import { TenantMapper } from '@core/mappers/tenant.mapper';
import { UserMapper } from '@core/mappers/user.mapper';
import { RegisterTenant } from '@core/models/tenants.model';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private tenantsService = inject(TenantsService);
  private tenantMapper = inject(TenantMapper);
  private userMapper = inject(UserMapper);

  registerTenant(registerTenant: RegisterTenant) {
    const requestBody = this.tenantMapper.mapToRegisterTenantDto(registerTenant);

    return this.tenantsService
      .registerTenant({ body: requestBody }, new HttpContext().set(AUTHORIZED, false))
      .pipe(map(({ data }) => this.userMapper.mapToUserModel(data!)));
  }
}
