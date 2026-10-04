import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { TraceService } from "@sentry/angular";

import {
  getSentryDsn,
  initSentry,
  provideSentry,
  provideSentryErrorHandler,
  provideSentryTracing,
  shouldInitializeSentry,
} from "./sentry.config";

describe("sentry.config", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("getSentryDsn", () => {
    it("should return empty string if no environment variable or window is configured", () => {
      delete process.env["SENTRY_DSN"];
      const dsn = getSentryDsn();
      expect(dsn).toBe("");
    });
  });

  describe("shouldInitializeSentry", () => {
    it("should return options.enabled if specified as boolean", () => {
      expect(
        shouldInitializeSentry({
          dsn: "https://test@sentry.io/1",
          enabled: false,
        })
      ).toBe(false);
      expect(shouldInitializeSentry({ enabled: true })).toBe(true);
    });

    it("should return true when dsn is explicitly provided", () => {
      expect(shouldInitializeSentry({ dsn: "https://test@sentry.io/1" })).toBe(
        true
      );
    });

    it("should return false when no dsn is provided and in dev mode", () => {
      delete process.env["SENTRY_DSN"];
      expect(shouldInitializeSentry()).toBe(false);
    });
  });

  describe("initSentry", () => {
    it("should not invoke initializer if shouldInitializeSentry returns false", () => {
      const mockInit = vi.fn();
      const result = initSentry({ enabled: false }, mockInit);
      expect(result).toBe(false);
      expect(mockInit).not.toHaveBeenCalled();
    });

    it("should invoke initializer with default tracePropagationTargets when not provided", () => {
      const mockInit = vi.fn();
      const dsn = "https://example@sentry.io/123";
      const result = initSentry({ dsn }, mockInit);

      expect(result).toBe(true);
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn,
          tracePropagationTargets: ["localhost", /^\/api/u],
        })
      );
    });

    it("should invoke initializer with custom tracePropagationTargets when provided", () => {
      const mockInit = vi.fn();
      const dsn = "https://example@sentry.io/123";
      const customTargets = ["https://api.example.com", /^\/v1/u];
      const result = initSentry(
        { dsn, tracePropagationTargets: customTargets },
        mockInit
      );

      expect(result).toBe(true);
      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn,
          tracePropagationTargets: customTargets,
        })
      );
    });
  });

  describe("provideSentryErrorHandler", () => {
    it("should provide ErrorHandler", () => {
      /* SAFETY: ErrorHandler provider returns object with provide and useValue properties */
      const provider = provideSentryErrorHandler() as {
        provide: unknown;
        useValue: unknown;
      };
      expect(provider.provide).toBe(ErrorHandler);
      expect(provider.useValue).toBeDefined();
    });
  });

  describe("provideSentryTracing", () => {
    it("should include TraceService provider configured with Router factory", () => {
      const providers = provideSentryTracing();
      /* SAFETY: First provider in provideSentryTracing is the TraceService FactoryProvider */
      const traceProvider = providers[0] as {
        deps: [typeof Router];
        provide: typeof TraceService;
        useFactory: (router: Router) => TraceService;
      };

      expect(traceProvider.provide).toBe(TraceService);
      expect(traceProvider.deps).toEqual([Router]);
      TestBed.configureTestingModule({
        providers: [provideRouter([])],
      });
      const router = TestBed.inject(Router);
      const instance = traceProvider.useFactory(router);
      expect(instance).toBeInstanceOf(TraceService);
    });
  });

  describe("provideSentry", () => {
    it("should initialize sentry and return combined providers", () => {
      const providers = provideSentry({
        dsn: "https://test@sentry.io/1",
        tracePropagationTargets: ["localhost", /^\/api/u],
      });
      expect(providers.length).toBeGreaterThan(0);
    });
  });
});
