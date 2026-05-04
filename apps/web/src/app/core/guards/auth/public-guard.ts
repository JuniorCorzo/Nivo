import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth-service';
import { APP_ROUTES } from '@shared/constants/app-routes.constant';

export const publicGuard: CanActivateFn = (route, state) => {
  const isAuthenticate = inject(AuthService).isAuthenticate();
  const router = inject(Router);

  return isAuthenticate ? router.createUrlTree([APP_ROUTES.app.parkingLots]) : true;
};
