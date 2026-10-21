import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from "@angular/router";
import { Subject } from "rxjs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSentryDsn,
  initSentry,
  provideSentry,
  provideSentryErrorHandler,
  provideSentryTracing,
  shouldInitializeSentry,
} from "../monitoring/sentry.config";
import {
  categorizeHttpStatus,
  filterLowCardinalityLabels,
  MetricsService,
  normalizeErrorType,
  sanitizeRoutePath,
} from "./metrics.service";

interface MockRouterState {
  events: Subject<unknown>;
  routerState: {
    snapshot: {
      root: {
        firstChild: {
          firstChild: null;
          routeConfig: { path: string };
        };
        routeConfig: { path: string };
      };
    };
  };
}

describe("MetricsService and Frontend Observability", () => {
  let routerEvents$: Subject<unknown>;
  let mockRouter: MockRouterState;

  beforeEach(() => {
    routerEvents$ = new Subject();
    mockRouter = {
      events: routerEvents$,
      routerState: {
        snapshot: {
          root: {
            firstChild: {
              firstChild: null,
              routeConfig: { path: "dashboard" },
            },
            routeConfig: { path: "app" },
          },
        },
      },
    };

    TestBed.configureTestingModule({
      providers: [MetricsService, { provide: Router, useValue: mockRouter }],
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Low-cardinality sanitizer (sanitizeRoutePath & filterLowCardinalityLabels)", () => {
    it("should return root slash for empty, null, or undefined paths", () => {
      expect(sanitizeRoutePath("")).toBe("/");
      expect(sanitizeRoutePath(null)).toBe("/");
      expect(sanitizeRoutePath()).toBe("/");
    });

    it("should preserve static route templates", () => {
      expect(sanitizeRoutePath("/app/dashboard")).toBe("/app/dashboard");
      expect(sanitizeRoutePath("/auth/login")).toBe("/auth/login");
    });

    it("should replace UUIDs with :id to prevent high-cardinality explosion", () => {
      const pathWithUuid =
        "/app/parking-lots/550e8400-e29b-41d4-a716-446655440000/slots";
      expect(sanitizeRoutePath(pathWithUuid)).toBe(
        "/app/parking-lots/:id/slots"
      );
    });

    it("should replace 24-character hexadecimal IDs (MongoDB ObjectIDs) with :id", () => {
      const mongoIdPath = "/app/parking-lots/60d5ec49f1b2c8a1e8a8b123/edit";
      expect(sanitizeRoutePath(mongoIdPath)).toBe("/app/parking-lots/:id/edit");
    });

    it("should replace entity-prefixed identifiers (parking, slot, rate, tenant, ticket, user)", () => {
      expect(
        sanitizeRoutePath("/app/parking-lots/parking-123/slots/slot-999")
      ).toBe("/app/parking-lots/:id/slots/:id");
      expect(sanitizeRoutePath("/app/tenants/tenant-abc/rates/rate-555")).toBe(
        "/app/tenants/:id/rates/:id"
      );
      expect(sanitizeRoutePath("/app/tickets/ticket-4422/user/user-771")).toBe(
        "/app/tickets/:id/user/:id"
      );
    });

    it("should replace vehicle license plates to preserve privacy and low cardinality", () => {
      expect(sanitizeRoutePath("/app/vehicles/ABC123/history")).toBe(
        "/app/vehicles/:id/history"
      );
      expect(sanitizeRoutePath("/app/vehicles/COL-98K/status")).toBe(
        "/app/vehicles/:id/status"
      );
    });

    it("should replace numeric path segments with :id", () => {
      expect(sanitizeRoutePath("/app/operations/98765/inspect")).toBe(
        "/app/operations/:id/inspect"
      );
      expect(sanitizeRoutePath("/app/tickets/42")).toBe("/app/tickets/:id");
    });

    it("should strip query parameters and hash fragments entirely", () => {
      const complexUrl =
        "/app/dashboard?tenantId=tenant-1&parkingId=parking-2&plate=XYZ123#analytics";
      expect(sanitizeRoutePath(complexUrl)).toBe("/app/dashboard");
    });

    it("should strictly enforce Engram Memory #988 by dropping forbidden high-cardinality keys", () => {
      const labels = {
        error_type: "client_error",
        licensePlate: "ABC123",
        license_plate: "XYZ-789",
        parkingId: "parking-abc",
        parking_id: "parking-def",
        plate: "COL456",
        route: "/app/parking-lots/parking-123/slots",
        slotId: "slot-555",
        status_category: "4xx",
        tenantId: "tenant-999",
        tenant_id: "tenant-888",
        userId: "user-123",
      };

      const filtered = filterLowCardinalityLabels(labels);

      expect(filtered["error_type"]).toBe("client_error");
      expect(filtered["status_category"]).toBe("4xx");
      expect(filtered["route"]).toBe("/app/parking-lots/:id/slots");
      expect(filtered["tenantId"]).toBeUndefined();
      expect(filtered["tenant_id"]).toBeUndefined();
      expect(filtered["parkingId"]).toBeUndefined();
      expect(filtered["parking_id"]).toBeUndefined();
      expect(filtered["licensePlate"]).toBeUndefined();
      expect(filtered["license_plate"]).toBeUndefined();
      expect(filtered["plate"]).toBeUndefined();
      expect(filtered["slotId"]).toBeUndefined();
      expect(filtered["userId"]).toBeUndefined();
    });
  });

  describe("HTTP status and error type categorization", () => {
    it("should categorize 4xx and 5xx correctly", () => {
      expect(categorizeHttpStatus(400)).toBe("4xx");
      expect(categorizeHttpStatus(404)).toBe("4xx");
      expect(categorizeHttpStatus(409)).toBe("4xx");
      expect(categorizeHttpStatus(500)).toBe("5xx");
      expect(categorizeHttpStatus(502)).toBe("5xx");
      expect(categorizeHttpStatus(503)).toBe("5xx");
      expect(categorizeHttpStatus(200)).toBe("2xx");
      expect(categorizeHttpStatus(Number.NaN)).toBe("unknown");
    });

    it("should normalize error types cleanly", () => {
      expect(normalizeErrorType("TimeoutError", "unknown")).toBe(
        "timeouterror"
      );
      expect(normalizeErrorType(undefined, "5xx")).toBe("server_error");
      expect(normalizeErrorType(undefined, "4xx")).toBe("client_error");
      expect(normalizeErrorType(undefined, "unknown")).toBe("unknown_error");
    });
  });

  describe("Core Web Vitals tracking", () => {
    it("should record Core Web Vitals gauges (LCP, CLS, INP, FID)", () => {
      const service = TestBed.inject(MetricsService);

      service.recordWebVital("lcp", 1.85, "/app/dashboard");
      service.recordWebVital("cls", 0.03, "/app/dashboard");
      service.recordWebVital("inp", 0.065, "/app/dashboard");
      service.recordWebVital("fid", 0.012, "/app/dashboard");

      const text = service.getMetricsAsPrometheusText();

      expect(text).toContain("# HELP nivo_frontend_web_vitals");
      expect(text).toContain("# TYPE nivo_frontend_web_vitals gauge");
      expect(text).toContain(
        'nivo_frontend_web_vitals{metric="lcp",route="/app/dashboard"} 1.85'
      );
      expect(text).toContain(
        'nivo_frontend_web_vitals{metric="cls",route="/app/dashboard"} 0.03'
      );
      expect(text).toContain(
        'nivo_frontend_web_vitals{metric="inp",route="/app/dashboard"} 0.065'
      );
      expect(text).toContain(
        'nivo_frontend_web_vitals{metric="fid",route="/app/dashboard"} 0.012'
      );
    });

    it("should disconnect PerformanceObservers safely on destroy", () => {
      const service = TestBed.inject(MetricsService);
      expect(() => {
        service.disconnectObservers();
        service.ngOnDestroy();
      }).not.toThrow();
    });
  });

  describe("Route navigation duration tracking", () => {
    it("should record navigation duration metric", () => {
      const service = TestBed.inject(MetricsService);

      service.recordNavigationDuration("/app/dashboard", 0.142);

      const text = service.getMetricsAsPrometheusText();
      expect(text).toContain(
        "# HELP nivo_frontend_route_navigation_duration_seconds"
      );
      expect(text).toContain(
        'nivo_frontend_route_navigation_duration_seconds{route="/app/dashboard"} 0.142'
      );
    });

    it("should automatically measure navigation duration across NavigationStart and NavigationEnd", () => {
      const service = TestBed.inject(MetricsService);
      const perfNowSpy = vi.spyOn(performance, "now");

      perfNowSpy.mockReturnValue(1000);
      routerEvents$.next(new NavigationStart(1, "/app/dashboard"));

      perfNowSpy.mockReturnValue(1250);
      routerEvents$.next(
        new NavigationEnd(1, "/app/dashboard", "/app/dashboard")
      );

      const text = service.getMetricsAsPrometheusText();
      expect(text).toContain(
        'nivo_frontend_route_navigation_duration_seconds{route="/app/dashboard"} 0.25'
      );
    });

    it("should reset timer on NavigationCancel and NavigationError", () => {
      const service = TestBed.inject(MetricsService);
      const perfNowSpy = vi.spyOn(performance, "now");

      perfNowSpy.mockReturnValue(1000);
      routerEvents$.next(new NavigationStart(1, "/app/dashboard"));
      routerEvents$.next(
        new NavigationCancel(1, "/app/dashboard", "cancelled")
      );

      perfNowSpy.mockReturnValue(1500);
      routerEvents$.next(
        new NavigationEnd(1, "/app/dashboard", "/app/dashboard")
      );

      // Should not record navigation duration because start timestamp was cancelled
      const text = service.getMetricsAsPrometheusText();
      expect(text).not.toContain(
        "nivo_frontend_route_navigation_duration_seconds"
      );

      // Verify NavigationError also resets start timestamp
      perfNowSpy.mockReturnValue(2000);
      routerEvents$.next(new NavigationStart(2, "/app/dashboard"));
      routerEvents$.next(
        new NavigationError(2, "/app/dashboard", new Error("routing failure"))
      );

      perfNowSpy.mockReturnValue(2500);
      routerEvents$.next(
        new NavigationEnd(2, "/app/dashboard", "/app/dashboard")
      );
      expect(service.getMetricsAsPrometheusText()).not.toContain(
        "nivo_frontend_route_navigation_duration_seconds"
      );
    });
  });

  describe("API error and SSE drops tracking", () => {
    it("should track frontend API errors with low-cardinality status tags", () => {
      const service = TestBed.inject(MetricsService);

      service.recordApiError({
        errorType: "client_error",
        route: "/app/parking-lots/parking-123/slots",
        statusCode: 404,
      });

      service.recordApiError({
        errorType: "client_error",
        route: "/app/parking-lots/parking-456/slots",
        statusCode: 404,
      });

      service.recordApiError({
        statusCode: 500,
      });

      const text = service.getMetricsAsPrometheusText();

      expect(text).toContain("# HELP nivo_frontend_api_errors_total");
      expect(text).toContain("# TYPE nivo_frontend_api_errors_total counter");
      // Notice both parking-123 and parking-456 map to :id and aggregate!
      expect(text).toContain(
        'nivo_frontend_api_errors_total{error_type="client_error",route="/app/parking-lots/:id/slots",status_category="4xx"} 2'
      );
      expect(text).toContain(
        'nivo_frontend_api_errors_total{error_type="server_error",route="/app/dashboard",status_category="5xx"} 1'
      );
    });

    it("should track SSE connection drops with low-cardinality error classifications", () => {
      const service = TestBed.inject(MetricsService);

      service.recordSseDrop({
        errorType: "stream_disconnect",
        route: "/app/dashboard",
      });
      service.recordSseDrop({
        errorType: "stream_disconnect",
        route: "/app/dashboard",
      });

      const text = service.getMetricsAsPrometheusText();

      expect(text).toContain("# HELP nivo_frontend_sse_connection_drops_total");
      expect(text).toContain(
        "# TYPE nivo_frontend_sse_connection_drops_total counter"
      );
      expect(text).toContain(
        'nivo_frontend_sse_connection_drops_total{error_type="stream_disconnect",route="/app/dashboard"} 2'
      );
    });
  });

  describe("Prometheus exposition format & Snapshot", () => {
    it("should return empty string when buffer is empty", () => {
      const service = TestBed.inject(MetricsService);
      expect(service.getMetricsAsPrometheusText()).toBe("");
    });

    it("should escape special characters in label values", () => {
      const service = TestBed.inject(MetricsService);
      service.recordApiError({
        errorType: 'custom"error\\quote',
        route: "/app/dashboard",
        statusCode: 400,
      });

      const text = service.getMetricsAsPrometheusText();
      expect(text).toContain('error_type="custom\\"error\\\\quote"');
    });

    it("should provide structured snapshot of current metrics", () => {
      const service = TestBed.inject(MetricsService);
      service.recordApiError({ statusCode: 500 });

      const snapshot = service.getMetricsSnapshot();
      expect(snapshot.timestamp).toBeGreaterThan(0);
      expect(snapshot.metrics.length).toBe(1);
      expect(snapshot.metrics[0]?.name).toBe("nivo_frontend_api_errors_total");
      expect(snapshot.metrics[0]?.value).toBe(1);
    });

    it("should reset metrics buffer completely", () => {
      const service = TestBed.inject(MetricsService);
      service.recordApiError({ statusCode: 500 });
      expect(service.getMetricsSnapshot().metrics.length).toBe(1);

      service.reset();
      expect(service.getMetricsSnapshot().metrics.length).toBe(0);
      expect(service.getMetricsAsPrometheusText()).toBe("");
    });
  });

  describe("Telemetry flush export", () => {
    it("should return true when metrics buffer is empty without network call", async () => {
      const service = TestBed.inject(MetricsService);
      const flushed = await service.flush();
      expect(flushed).toBe(true);
    });

    it("should flush telemetry using sendBeacon when available", async () => {
      const service = TestBed.inject(MetricsService);
      service.recordApiError({ statusCode: 500 });

      const sendBeaconSpy = vi
        .spyOn(navigator, "sendBeacon")
        .mockReturnValue(true);

      const flushed = await service.flush("/api/v1/metrics/test");

      expect(flushed).toBe(true);
      expect(sendBeaconSpy).toHaveBeenCalledWith(
        "/api/v1/metrics/test",
        expect.any(Blob)
      );
    });

    it("should flush telemetry using fetch when sendBeacon is not available", async () => {
      const service = TestBed.inject(MetricsService);
      service.recordApiError({ statusCode: 500 });

      // Mock sendBeacon returning false to fall back to fetch
      vi.spyOn(navigator, "sendBeacon").mockReturnValue(false);

      /* SAFETY: Mocking fetch response for unit test */
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
      } as Response);

      const flushed = await service.flush("/api/v1/metrics/test");

      expect(flushed).toBe(true);
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/v1/metrics/test",
        expect.objectContaining({
          headers: {
            "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
          },
          method: "POST",
        })
      );
    });
  });

  describe("Sentry Configuration and Initialization", () => {
    it("should resolve Sentry DSN from environment or global", () => {
      /* SAFETY: Window assignment for testing DSN resolution */
      const win = window as { SENTRY_DSN?: string };
      win.SENTRY_DSN = "https://public@sentry.io/123";

      expect(getSentryDsn()).toBe("https://public@sentry.io/123");

      delete win.SENTRY_DSN;
    });

    it("should conditionally evaluate initialization", () => {
      expect(shouldInitializeSentry({ enabled: false })).toBe(false);
      expect(shouldInitializeSentry({ enabled: true })).toBe(true);
      expect(shouldInitializeSentry({ dsn: "https://key@sentry.io/456" })).toBe(
        true
      );
    });

    it("should call Sentry initializer when enabled with DSN", () => {
      const mockInitializer = vi.fn();

      const initialized = initSentry(
        {
          dsn: "https://key@sentry.io/789",
          enabled: true,
        },
        mockInitializer
      );

      expect(initialized).toBe(true);
      expect(mockInitializer).toHaveBeenCalledWith(
        expect.objectContaining({
          dsn: "https://key@sentry.io/789",
        })
      );
    });

    it("should skip Sentry initializer when disabled or no DSN", () => {
      const mockInitializer = vi.fn();

      const initialized = initSentry(
        {
          dsn: "",
          enabled: false,
        },
        mockInitializer
      );

      expect(initialized).toBe(false);
      expect(mockInitializer).not.toHaveBeenCalled();
    });

    it("should provide Sentry ErrorHandler provider", () => {
      /* SAFETY: Provider object structure contains provide and useValue */
      const provider = provideSentryErrorHandler() as {
        provide: unknown;
        useValue: unknown;
      };

      expect(provider.provide).toBe(ErrorHandler);
      expect(provider.useValue).toBeDefined();
    });

    it("should provide Sentry tracing providers and full bundle", () => {
      const tracingProviders = provideSentryTracing();
      expect(tracingProviders.length).toBeGreaterThan(0);

      const bundle = provideSentry({ enabled: false });
      expect(bundle.length).toBeGreaterThanOrEqual(2);
    });
  });
});
