import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth-service';
import { AUTHORIZED } from '../context/auth.token';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.context.get(AUTHORIZED)) return next(req);
  const accessToken = inject(AuthService).accessTokenSignal();

  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
  );
};
