import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@core/services/auth-service';

export const publicGuard: CanActivateFn = (route, state) => {
  const isAuthenticate = inject(AuthService).isAuthenticate();
  const router = inject(Router);

  return isAuthenticate ? router.createUrlTree(['/dashboard']) : true;
};
