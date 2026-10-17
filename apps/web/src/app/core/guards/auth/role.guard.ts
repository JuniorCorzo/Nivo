import { inject } from "@angular/core";
import { Router } from "@angular/router";
import type { CanActivateFn } from "@angular/router";
import { UserService } from "@core/services/user/user-service";
import type { Role } from "@core/type/role.type";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";
import { map } from "rxjs";

export const roleGuard =
  (allowedRoles: Role[]): CanActivateFn =>
  () => {
    const userService = inject(UserService);
    const router = inject(Router);

    return userService.loadCurrentUser().pipe(
      map((currentUser) => {
        if (currentUser && allowedRoles.includes(currentUser.role)) {
          return true;
        }

        return router.createUrlTree([APP_ROUTES.app.parkingLots]);
      })
    );
  };

