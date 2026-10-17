import { inject } from "@angular/core";
import { Router } from "@angular/router";
import type { CanActivateFn } from "@angular/router";
import { UserService } from "@core/services/user/user-service";
import type { Role } from "@core/type/role.type";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

export const roleGuard =
  (allowedRoles: Role[]): CanActivateFn =>
  () => {
    const userService = inject(UserService);
    const router = inject(Router);
    const currentUser = userService.currentUser();

    if (currentUser && allowedRoles.includes(currentUser.role)) {
      return true;
    }

    return router.createUrlTree([APP_ROUTES.app.parkingLots]);
  };
