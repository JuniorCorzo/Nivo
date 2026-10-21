import type {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "@core/services/auth-service";
import {
  BehaviorSubject,
  catchError,
  filter,
  mergeMap,
  switchMap,
  take,
  throwError,
} from "rxjs";

import { AUTHORIZED } from "../context/auth.token";

let isRefresh = false;
const newToken$ = new BehaviorSubject<string | null>(null);

export const _resetRefreshTokenState = () => {
  isRefresh = false;
  newToken$.next(null);
};

const withToken = (req: HttpRequest<unknown>, token: string) =>
  req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

const refreshToken = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) => {
  isRefresh = true;
  newToken$.next(null);

  return authService.refreshSession().pipe(
    switchMap((token) => {
      isRefresh = false;
      newToken$.next(token);

      return next(withToken(req, token));
    }),
    catchError((failure) => {
      isRefresh = false;
      newToken$.next(null);
      authService.logout();

      return throwError(() => failure);
    })
  );
};

const handleUnauthorized = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService
) => {
  if (!isRefresh) {
    return refreshToken(req, next, authService);
  }

  return newToken$.pipe(
    filter((token): token is string => token !== null),
    take(1),
    mergeMap((token) => next(withToken(req, token)))
  );
};

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.context.get(AUTHORIZED)) {
    return next(req);
  }
  const authService = inject(AuthService);
  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      const { status } = httpError;
      if (status !== 401) {
        return throwError(() => httpError);
      }

      return handleUnauthorized(req, next, authService);
    })
  );
};
