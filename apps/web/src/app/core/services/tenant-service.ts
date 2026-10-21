import { HttpContext } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TenantsService } from "@core/api/generated/services";
import { AUTHORIZED } from "@core/http/context/auth.token";
import { mapToRegisterTenantDto } from "@core/mappers/tenant.mapper";
import { mapToUserModel } from "@core/mappers/user.mapper";
import type { RegisterTenant } from "@core/models/tenants.model";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class TenantService {
  private tenantsService = inject(TenantsService);

  registerTenant(registerTenant: RegisterTenant) {
    const requestBody = mapToRegisterTenantDto(registerTenant);

    return this.tenantsService
      .registerTenant(
        { body: requestBody },
        new HttpContext().set(AUTHORIZED, false)
      )
      .pipe(map(({ data }) => mapToUserModel(data)));
  }
}
