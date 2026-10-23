import { inject, Injectable, signal } from "@angular/core";
import { PublicConfigurationService } from "@core/api/generated/services/public-configuration.service";
import { catchError, of, tap } from 'rxjs';
import type { Observable } from 'rxjs';

@Injectable({
  providedIn: "root",
})
export class FeatureFlagService {
  private readonly publicConfigService = inject(PublicConfigurationService);
  private readonly isEnabledSignal = signal<boolean>(false);

  readonly accountCreationEnabled = this.isEnabledSignal.asReadonly();

  loadRemoteConfig(): Observable<unknown> {
    return this.publicConfigService.getConfig().pipe(
      tap((res) => {
        if (
          res?.accountCreationEnabled === true ||
          res?.accountCreationEnabled === false
        ) {
          this.isEnabledSignal.set(res.accountCreationEnabled);
        }
      }),
      catchError(() => of(null))
    );
  }
}
