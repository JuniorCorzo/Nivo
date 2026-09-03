import { inject } from "@angular/core";
import type { CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

export const publicGuard: CanActivateFn = () => {
  const isAuthenticate = inject(AuthService).isAuthenticate();
  const router = inject(Router);

  return isAuthenticate
    ? router.createUrlTree([APP_ROUTES.app.parkingLots])
    : true;
};
