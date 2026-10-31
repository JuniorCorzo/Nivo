import { inject, Injectable, signal } from "@angular/core";
import { PublicConfigurationService } from "@core/api/generated/services/public-configuration.service";
import { catchError, of, tap } from "rxjs";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FeatureFlagService {
  private readonly publicConfigService = inject(PublicConfigurationService);
  private readonly isEnabledSignal = signal<boolean>(false);
  private readonly isPaymentEnabledSignal = signal<boolean>(true);

  readonly accountCreationEnabled = this.isEnabledSignal.asReadonly();
  readonly paymentEnabled = this.isPaymentEnabledSignal.asReadonly();

  loadRemoteConfig(): Observable<unknown> {
    return this.publicConfigService.getConfig().pipe(
      tap((res) => {
        if (
          res?.accountCreationEnabled === true ||
          res?.accountCreationEnabled === false
        ) {
          this.isEnabledSignal.set(res.accountCreationEnabled);
        }
        if (res?.paymentEnabled === true || res?.paymentEnabled === false) {
          this.isPaymentEnabledSignal.set(res.paymentEnabled);
        }
      }),
      catchError(() => of(null))
    );
  }
}
