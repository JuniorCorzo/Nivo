import "@angular/compiler";
import type { HttpEvent, HttpHandlerFn } from "@angular/common/http";
import {
  HttpContext,
  HttpErrorResponse,
  HttpRequest,
  HttpResponse,
} from "@angular/common/http";
import { Injector, runInInjectionContext } from "@angular/core";
import { AuthService } from "@core/services/auth-service";
import type { Observable } from "rxjs";
import { Subject, firstValueFrom, of, throwError } from "rxjs";

import { AUTHORIZED } from "../context/auth.token";
import {
  refreshTokenInterceptor,
  _resetRefreshTokenState,
} from "./refresh-token-interceptor";

interface AuthServiceMock {
  logout: ReturnType<typeof vi.fn>;
  refreshSession: ReturnType<typeof vi.fn>;
}

describe("refreshTokenInterceptor", () => {
  let authServiceMock: AuthServiceMock;
  let injector: Injector;

  const runInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
  ): Observable<HttpEvent<unknown>> =>
    runInInjectionContext(injector, () => refreshTokenInterceptor(req, next));

  beforeEach(() => {
    _resetRefreshTokenState();

    authServiceMock = {
      logout: vi.fn(),
      refreshSession: vi.fn().mockReturnValue(of("mocked-refreshed-token")),
    };

    injector = Injector.create({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });
  });

  it("should be created", () => {
    expect(refreshTokenInterceptor).toBeTruthy();
  });

  it("should pass through when AUTHORIZED context is false or missing", async () => {
    const req = new HttpRequest("GET", "/api/public-data");
    const expectedResponse = new HttpResponse({ body: "public", status: 200 });
    const next: HttpHandlerFn = vi.fn().mockReturnValue(of(expectedResponse));

    const res = await firstValueFrom(runInterceptor(req, next));
    expect(res).toBe(expectedResponse);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(req);
    expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
  });

  it("should pass through successful requests when AUTHORIZED is true", async () => {
    const req = new HttpRequest("GET", "/api/protected", {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const expectedResponse = new HttpResponse({ body: "success", status: 200 });
    const next: HttpHandlerFn = vi.fn().mockReturnValue(of(expectedResponse));

    const res = await firstValueFrom(runInterceptor(req, next));
    expect(res).toBe(expectedResponse);
    expect(next).toHaveBeenCalledTimes(1);
    expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
  });

  it("should rethrow non-401 errors without attempting to refresh the token", async () => {
    const req = new HttpRequest("GET", "/api/protected", {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const error500 = new HttpErrorResponse({
      status: 500,
      statusText: "Server Error",
    });
    const next: HttpHandlerFn = vi
      .fn()
      .mockReturnValue(throwError(() => error500));

    await expect(firstValueFrom(runInterceptor(req, next))).rejects.toBe(
      error500
    );
    expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
    expect(authServiceMock.logout).not.toHaveBeenCalled();
  });

  it("should handle 401 by refreshing token and retrying request with Bearer prefix", async () => {
    const req = new HttpRequest("GET", "/api/protected", {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const error401 = new HttpErrorResponse({
      status: 401,
      statusText: "Unauthorized",
    });
    const successResponse = new HttpResponse({
      body: { data: "refreshed" },
      status: 200,
    });

    let callCount = 0;
    const next = vi.fn<HttpHandlerFn>((_request) => {
      callCount += 1;
      if (callCount === 1) {
        return throwError(() => error401);
      }
      return of(successResponse);
    });

    authServiceMock.refreshSession.mockReturnValue(of("fresh-jwt-token-123"));

    const res = await firstValueFrom(runInterceptor(req, next));
    expect(res).toBe(successResponse);
    expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(callCount).toBe(2);
    const secondCallReq = next.mock.calls[1]?.[0];
    expect(secondCallReq?.headers.get("Authorization")).toBe(
      "Bearer fresh-jwt-token-123"
    );
  });

  it("should queue concurrent 401 requests and retry them all with the new Bearer token", async () => {
    const req1 = new HttpRequest("GET", "/api/resource-1", {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const req2 = new HttpRequest("GET", "/api/resource-2", {
      context: new HttpContext().set(AUTHORIZED, true),
    });

    const error401 = new HttpErrorResponse({
      status: 401,
      statusText: "Unauthorized",
    });
    const refreshSubject = new Subject<string>();
    authServiceMock.refreshSession.mockReturnValue(
      refreshSubject.asObservable()
    );

    let req1Calls = 0;
    let req2Calls = 0;

    const next1 = vi.fn<HttpHandlerFn>((_request) => {
      req1Calls += 1;
      if (req1Calls === 1) {
        return throwError(() => error401);
      }
      return of(new HttpResponse({ body: "res-1", status: 200 }));
    });

    const next2 = vi.fn<HttpHandlerFn>((_request) => {
      req2Calls += 1;
      if (req2Calls === 1) {
        return throwError(() => error401);
      }
      return of(new HttpResponse({ body: "res-2", status: 200 }));
    });

    const p1 = firstValueFrom(runInterceptor(req1, next1));
    const p2 = firstValueFrom(runInterceptor(req2, next2));

    // Emit the refreshed token
    refreshSubject.next("queued-token-xyz");
    refreshSubject.complete();

    await Promise.all([p1, p2]);

    expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(req1Calls).toBe(2);
    expect(req2Calls).toBe(2);

    const retriedReq1 = next1.mock.calls[1]?.[0];
    const retriedReq2 = next2.mock.calls[1]?.[0];

    expect(retriedReq1?.headers.get("Authorization")).toBe(
      "Bearer queued-token-xyz"
    );
    expect(retriedReq2?.headers.get("Authorization")).toBe(
      "Bearer queued-token-xyz"
    );
  });

  it("should handle refresh failure by resetting isRefresh, calling authService.logout(), and rethrowing error", async () => {
    const req = new HttpRequest("GET", "/api/protected", {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const error401 = new HttpErrorResponse({
      status: 401,
      statusText: "Unauthorized",
    });
    const refreshError = new HttpErrorResponse({
      status: 401,
      statusText: "Refresh Expired",
    });

    const next: HttpHandlerFn = vi
      .fn()
      .mockReturnValue(throwError(() => error401));
    authServiceMock.refreshSession.mockReturnValue(
      throwError(() => refreshError)
    );

    await expect(firstValueFrom(runInterceptor(req, next))).rejects.toBe(
      refreshError
    );
    expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);
    expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
  });
});
