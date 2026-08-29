import '@angular/compiler';
import { Injector, runInInjectionContext } from '@angular/core';
import {
  HttpContext,
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, Subject, of, throwError } from 'rxjs';
import { mock, describe, it, expect, beforeEach } from 'bun:test';
import { refreshTokenInterceptor, _resetRefreshTokenState } from './refresh-token-interceptor';
import { AUTHORIZED } from '../context/auth.token';
import { AuthService } from '@core/services/auth-service';

describe('refreshTokenInterceptor', () => {
  let authServiceMock: {
    refreshSession: ReturnType<typeof mock>;
    logout: ReturnType<typeof mock>;
  };
  let injector: Injector;

  const runInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
  ): Observable<HttpEvent<unknown>> => {
    return runInInjectionContext(injector, () => refreshTokenInterceptor(req, next));
  };

  beforeEach(() => {
    _resetRefreshTokenState();

    authServiceMock = {
      refreshSession: mock(() => of('mocked-refreshed-token')),
      logout: mock(() => {}),
    };

    injector = Injector.create({
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    });
  });

  it('should be created', () => {
    expect(refreshTokenInterceptor).toBeTruthy();
  });

  it('should pass through when AUTHORIZED context is false or missing', (done) => {
    const req = new HttpRequest('GET', '/api/public-data');
    const expectedResponse = new HttpResponse({ status: 200, body: 'public' });
    const next: HttpHandlerFn = mock(() => of(expectedResponse));

    runInterceptor(req, next).subscribe({
      next: (res) => {
        expect(res).toBe(expectedResponse);
        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith(req);
        expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
        done();
      },
      error: (err) => done(err),
    });
  });

  it('should pass through successful requests when AUTHORIZED is true', (done) => {
    const req = new HttpRequest('GET', '/api/protected', {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const expectedResponse = new HttpResponse({ status: 200, body: 'success' });
    const next: HttpHandlerFn = mock(() => of(expectedResponse));

    runInterceptor(req, next).subscribe({
      next: (res) => {
        expect(res).toBe(expectedResponse);
        expect(next).toHaveBeenCalledTimes(1);
        expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
        done();
      },
      error: (err) => done(err),
    });
  });

  it('should rethrow non-401 errors without attempting to refresh the token', (done) => {
    const req = new HttpRequest('GET', '/api/protected', {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const error500 = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    const next: HttpHandlerFn = mock(() => throwError(() => error500));

    runInterceptor(req, next).subscribe({
      next: () => {
        done(new Error('Should have failed'));
      },
      error: (err) => {
        expect(err).toBe(error500);
        expect(authServiceMock.refreshSession).not.toHaveBeenCalled();
        expect(authServiceMock.logout).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('should handle 401 by refreshing token and retrying request with Bearer prefix', (done) => {
    const req = new HttpRequest('GET', '/api/protected', {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const error401 = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const successResponse = new HttpResponse({ status: 200, body: { data: 'refreshed' } });

    let callCount = 0;
    const next: HttpHandlerFn = mock((retriedReq: HttpRequest<unknown>) => {
      callCount++;
      if (callCount === 1) {
        return throwError(() => error401);
      }
      return of(successResponse);
    });

    authServiceMock.refreshSession.mockReturnValue(of('fresh-jwt-token-123'));

    runInterceptor(req, next).subscribe({
      next: (res) => {
        expect(res).toBe(successResponse);
        expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);
        expect(callCount).toBe(2);
        const secondCallReq = (next.mock.calls[1] as [HttpRequest<unknown>])[0];
        expect(secondCallReq.headers.get('Authorization')).toBe('Bearer fresh-jwt-token-123');
        done();
      },
      error: (err) => done(err),
    });
  });

  it('should queue concurrent 401 requests and retry them all with the new Bearer token', (done) => {
    const req1 = new HttpRequest('GET', '/api/resource-1', {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const req2 = new HttpRequest('GET', '/api/resource-2', {
      context: new HttpContext().set(AUTHORIZED, true),
    });

    const error401 = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const refreshSubject = new Subject<string>();
    authServiceMock.refreshSession.mockReturnValue(refreshSubject.asObservable());

    let req1Calls = 0;
    let req2Calls = 0;

    const next1: HttpHandlerFn = mock((r: HttpRequest<unknown>) => {
      req1Calls++;
      if (req1Calls === 1) return throwError(() => error401);
      return of(new HttpResponse({ status: 200, body: 'res-1' }));
    });

    const next2: HttpHandlerFn = mock((r: HttpRequest<unknown>) => {
      req2Calls++;
      if (req2Calls === 1) return throwError(() => error401);
      return of(new HttpResponse({ status: 200, body: 'res-2' }));
    });

    let completedCount = 0;
    const checkAllDone = () => {
      completedCount++;
      if (completedCount === 2) {
        expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);
        expect(req1Calls).toBe(2);
        expect(req2Calls).toBe(2);

        const retriedReq1 = (next1.mock.calls[1] as [HttpRequest<unknown>])[0];
        const retriedReq2 = (next2.mock.calls[1] as [HttpRequest<unknown>])[0];

        expect(retriedReq1.headers.get('Authorization')).toBe('Bearer queued-token-xyz');
        expect(retriedReq2.headers.get('Authorization')).toBe('Bearer queued-token-xyz');
        done();
      }
    };

    // First request triggers the refresh flow
    runInterceptor(req1, next1).subscribe({
      next: () => checkAllDone(),
      error: (err) => done(err),
    });

    // Second request is queued while refresh is in progress
    runInterceptor(req2, next2).subscribe({
      next: () => checkAllDone(),
      error: (err) => done(err),
    });

    // Emit the refreshed token
    refreshSubject.next('queued-token-xyz');
    refreshSubject.complete();
  });

  it('should handle refresh failure by resetting isRefresh, calling authService.logout(), and rethrowing error', (done) => {
    const req = new HttpRequest('GET', '/api/protected', {
      context: new HttpContext().set(AUTHORIZED, true),
    });
    const error401 = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const refreshError = new HttpErrorResponse({ status: 401, statusText: 'Refresh Expired' });

    const next: HttpHandlerFn = mock(() => throwError(() => error401));
    authServiceMock.refreshSession.mockReturnValue(throwError(() => refreshError));

    runInterceptor(req, next).subscribe({
      next: () => {
        done(new Error('Should have failed'));
      },
      error: (err) => {
        expect(err).toBe(refreshError);
        expect(authServiceMock.refreshSession).toHaveBeenCalledTimes(1);
        expect(authServiceMock.logout).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });
});
