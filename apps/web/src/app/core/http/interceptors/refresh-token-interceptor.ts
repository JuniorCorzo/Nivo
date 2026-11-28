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
  finalize,
  map,
  mergeMap,
  of,
  switchMap,
  take,
  tap,
  throwError,
} from "rxjs";

import { AUTHORIZED } from "../context/auth.token";

type RefreshResult = { token: string } | { error: unknown };

class StaleSessionError extends Error {
  constructor() {
    super("Session invalidated during refresh");
    this.name = "StaleSessionError";
  }
}

let isRefresh = false;
const refreshResult$ = new BehaviorSubject<RefreshResult | null>(null);

export const _resetRefreshTokenState = () => {
  isRefresh = false;
  refreshResult$.next(null);
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
  refreshResult$.next(null);

  let settled = false;
  const publish = (result: RefreshResult) => {
    settled = true;
    isRefresh = false;
    refreshResult$.next(result);
  };

  return authService.refreshSession().pipe(
    map((token): RefreshResult =>
      token ? { token } : { error: new StaleSessionError() }
    ),
    catchError((failure: unknown) => {
      authService.logout();
      return of<RefreshResult>({ error: failure });
    }),
    tap(publish),
    finalize(() => {
      if (!settled) {
        publish({ error: new StaleSessionError() });
      }
    }),
    switchMap((result) =>
      "token" in result
        ? next(withToken(req, result.token))
        : throwError(() => result.error)
    )
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

  return refreshResult$.pipe(
    filter((result): result is RefreshResult => result !== null),
    take(1),
    mergeMap((result) =>
      "error" in result
        ? throwError(() => result.error)
        : next(withToken(req, result.token))
    )
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
