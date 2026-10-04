import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ApiConfiguration } from "@core/api/generated/api-configuration";
import type { DashboardSummaryModel } from "@core/models/dashboard.model";
import { AuthService } from "@core/services/auth-service";

import { DashboardSseService } from "./dashboard-sse.service";

describe("DashboardSseService", () => {
  let service: DashboardSseService;
  let mockTokenSignal: ReturnType<typeof signal<string | null>>;

  beforeEach(() => {
    mockTokenSignal = signal<string | null>("mock-jwt-token");

    TestBed.configureTestingModule({
      providers: [
        DashboardSseService,
        {
          provide: ApiConfiguration,
          useValue: { rootUrl: "http://localhost:8080/api" },
        },
        {
          provide: AuthService,
          useValue: { accessTokenSignal: mockTokenSignal },
        },
      ],
    });

    service = TestBed.inject(DashboardSseService);
  });

  afterEach(() => {
    service.disconnect();
  });

  it("should construct stream URL using ApiConfiguration.rootUrl without trailing slash", () => {
    const globalUrl = service.buildStreamUrl();
    expect(globalUrl).toBe("http://localhost:8080/api/dashboard/stream");

    const singleUrl = service.buildStreamUrl("pkg-456");
    expect(singleUrl).toBe(
      "http://localhost:8080/api/dashboard/stream?parkingId=pkg-456"
    );
  });

  it("should calculate exponential backoff delay capped at 30 seconds", () => {
    expect(service.calculateBackoffDelay(0)).toBe(1000);
    expect(service.calculateBackoffDelay(1)).toBe(2000);
    expect(service.calculateBackoffDelay(2)).toBe(4000);
    expect(service.calculateBackoffDelay(5)).toBe(30_000);
  });

  it("should process valid SSE message and emit mapped DashboardSummaryModel", () => {
    let emittedModel: DashboardSummaryModel | null = null;
    service.updates$.subscribe((val) => {
      emittedModel = val;
    });

    service.handleSseMessage("snapshot", {
      availableSlots: 60,
      currency: "COP",
      occupancyRate: 40,
      occupiedSlots: 40,
      scope: "GLOBAL",
      todayRevenue: 400_000,
      totalCapacity: 100,
    });

    expect(service.updates()?.occupancyRate).toBe(40);
    expect(service.updates()?.todayRevenue).toBe(400_000);
    expect(emittedModel).toEqual(service.updates());
  });

  it("should ignore invalid SSE message payloads safely", () => {
    service.handleSseMessage("unknown-event", null);
    service.handleSseMessage("unknown-event", "invalid-json");

    expect(service.updates()).toBeNull();
  });

  it("should connect using fetch with Bearer token and Accept headers", async () => {
    const originalFetch = window.fetch;
    let requestedUrl = "";
    let capturedHeaders: HeadersInit | undefined;

    window.fetch = vi
      .fn()
      .mockImplementation((url: string | URL | Request, init?: RequestInit) => {
        requestedUrl = url.toString();
        capturedHeaders = init?.headers;
        const mockStream = new ReadableStream({
          start(controller) {
            controller.close();
          },
        });
        return Promise.resolve(new Response(mockStream, { status: 200 }));
      });

    try {
      await service.connect("pkg-123");

      expect(requestedUrl).toBe(
        "http://localhost:8080/api/dashboard/stream?parkingId=pkg-123"
      );
      const headers = new Headers(capturedHeaders);
      expect(headers.get("Accept")).toBe("text/event-stream");
      expect(headers.get("Authorization")).toBe("Bearer mock-jwt-token");
    } finally {
      window.fetch = originalFetch;
    }
  });

  it("should abort ongoing stream on disconnect", () => {
    const mockAbort = vi.fn();
    /* SAFETY: private abortController property is injected for isolated unit test */
    Reflect.set(service, "abortController", {
      abort: mockAbort,
    });

    service.disconnect();

    expect(mockAbort).toHaveBeenCalled();
  });
});
