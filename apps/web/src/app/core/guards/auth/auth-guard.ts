import { inject } from "@angular/core";
import type { ActivatedRouteSnapshot, CanActivateFn } from "@angular/router";
import { Router } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { RedirectService } from "@core/services/redirect/redirect-service";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

const handleUnauthorized = (
  route: ActivatedRouteSnapshot,
  redirectService: RedirectService,
  router: Router
) => {
  redirectService.saveRedirectUrl(route);

  return router.createUrlTree([APP_ROUTES.auth.login]);
};

export const authGuard: CanActivateFn = (route) => {
  const isAuthenticate = inject(AuthService).isAuthenticate();
  const router = inject(Router);
  const redirectService = inject(RedirectService);

  return isAuthenticate
    ? true
    : handleUnauthorized(route, redirectService, router);
};
