import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { ApiConfiguration } from "@core/api/generated/api-configuration";
import { catchError, of, tap } from "rxjs";

export interface PublicConfig {
  accountCreationEnabled: boolean;
}

interface WindowWithEnv {
  __ENV__?: {
    ACCOUNT_CREATION_ENABLED?: string | boolean;
  };
  ACCOUNT_CREATION_ENABLED?: string | boolean;
}

@Injectable({
  providedIn: "root",
})
export class FeatureFlagService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ApiConfiguration);
  private readonly isEnabledSignal = signal<boolean>(
    FeatureFlagService.resolveInitialStatus()
  );

  readonly accountCreationEnabled = this.isEnabledSignal.asReadonly();

  constructor() {
    this.loadRemoteConfig();
  }

  private static resolveInitialStatus(): boolean {
    if ("window" in globalThis) {
      /* SAFETY: Window object in browser context holds optional environment properties */
      const win = globalThis.window as WindowWithEnv;
      const rawEnv =
        win.__ENV__?.ACCOUNT_CREATION_ENABLED ?? win.ACCOUNT_CREATION_ENABLED;
      if (rawEnv !== undefined) {
        return rawEnv === true || rawEnv === "true";
      }
    }
    return false;
  }

  loadRemoteConfig(): void {
    const url = `${this.config.rootUrl}/public/config`;
    this.http
      .get<PublicConfig>(url)
      .pipe(
        tap((res) => {
          if (
            res?.accountCreationEnabled === true ||
            res?.accountCreationEnabled === false
          ) {
            this.isEnabledSignal.set(res.accountCreationEnabled);
          }
        }),
        catchError(() => of(null))
      )
      .subscribe();
  }
}
