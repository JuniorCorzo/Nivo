import { inject, Injectable } from '@angular/core';
import { ResponseUserDto } from '@core/api/generated/models';
import { TenantControllerService } from '@core/api/generated/services';
import { TenantMapper } from '@core/mappers/tenant.mapper';
import { UserMapper } from '@core/mappers/user.mapper';
import { ResponseErrorModel } from '@core/models/response.model';
import { RegisterTenant } from '@core/models/tenants.model';
import { UserModel } from '@core/models/user.model';
import { catchError, map, ObservableInput, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TenantService {
  private tenantController = inject(TenantControllerService);
  private tenantMapper = inject(TenantMapper);
  private userMapper = inject(UserMapper);

  registerTenant(registerTenant: RegisterTenant) {
    const requestBody = this.tenantMapper.mapToRegisterTenantDto(registerTenant);

    return this.tenantController
      .registerTenant({ body: requestBody })
      .pipe(map(({ data }) => this.userMapper.mapToUserModel(data)));
  }
}
