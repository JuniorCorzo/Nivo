import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, mergeMap, switchMap, take, throwError } from 'rxjs';
import { AUTHORIZED } from '../context/auth.token';
import { inject } from '@angular/core';
import { AuthService } from '@core/services/auth-service';

let isRefresh = false;
const newToken$ = new BehaviorSubject<string | null>(null);

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.context.get(AUTHORIZED)) return next(req);
  const authService = inject(AuthService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const status = err.status;
      if (status !== 401) return throwError(() => err);

      return handleUnauthorized(req, next, authService);
    }),
  );
};

const handleUnauthorized = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
) => {
  if (!isRefresh) {
    return refreshToken(req, next, authService);
  }

  return newToken$.pipe(
    filter((token): token is string => token !== null),
    take(1),
    mergeMap((token) => next(withToken(req, token))),
  );
};

const refreshToken = (req: HttpRequest<unknown>, next: HttpHandlerFn, authService: AuthService) => {
  isRefresh = true;
  newToken$.next(null);

  return authService.refreshSession().pipe(
    switchMap(() => {
      isRefresh = false;
      const token = authService.accessTokenSignal()!;
      newToken$.next(token);

      return next(withToken(req, token));
    }),
    catchError((err) => {
      isRefresh = false;
      authService.logout();

      return throwError(() => err);
    }),
  );
};

const withToken = (req: HttpRequest<unknown>, token: string) => {
  return req.clone({
    setHeaders: {
      Authorization: token,
    },
  });
};
