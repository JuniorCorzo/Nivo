import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { FeatureFlagService } from "@core/services/feature-flag.service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

export const accountCreationGuard: CanActivateFn = () => {
  const isEnabled = inject(FeatureFlagService).accountCreationEnabled();
  const router = inject(Router);

  return isEnabled ? true : router.createUrlTree([APP_ROUTES.auth.login]);
};
