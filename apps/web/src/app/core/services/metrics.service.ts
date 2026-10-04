import type { OnDestroy } from "@angular/core";
import { inject, Injectable } from "@angular/core";
import type { ActivatedRouteSnapshot } from "@angular/router";
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from "@angular/router";

export type WebVitalMetric = "cls" | "fid" | "inp" | "lcp";

export interface ApiErrorMetricParams {
  errorType?: string;
  route?: string;
  statusCategory?: string;
  statusCode?: number;
}

export interface SseDropMetricParams {
  errorType?: string;
  route?: string;
}

export interface MetricSnapshotEntry {
  labels: Record<string, string>;
  name: string;
  value: number;
}

export interface TelemetrySnapshot {
  metrics: MetricSnapshotEntry[];
  timestamp: number;
}

interface MetricSeries {
  help: string;
  labels: Record<string, string>;
  name: string;
  type: "counter" | "gauge";
  value: number;
}

interface ExtendedPerformanceObserverInit extends PerformanceObserverInit {
  durationThreshold?: number;
}

const FORBIDDEN_LABEL_KEYS = new Set([
  "licenseplate",
  "license_plate",
  "parkingid",
  "parking_id",
  "plate",
  "slotid",
  "slot_id",
  "tenantid",
  "tenant_id",
  "userid",
  "user_id",
]);

const isString = (val: unknown): val is string =>
  Object.prototype.toString.call(val) === "[object String]";

const isNumber = (val: unknown): val is number =>
  Object.prototype.toString.call(val) === "[object Number]" &&
  !Number.isNaN(val);

/**
 * Sanitizes a URL path into a strict low-cardinality route template.
 * Strips query strings, hashes, UUIDs, MongoDB ObjectIDs, entity prefix IDs,
 * vehicle plates, and numeric identifiers.
 */
export const sanitizeRoutePath = (rawPath?: string | null): string => {
  if (!rawPath || !isString(rawPath)) {
    return "/";
  }

  let path = rawPath.split("?")[0]?.split("#")[0] ?? "/";

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  // 1. UUIDs (8-4-4-4-12 hex format)
  path = path.replaceAll(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/gu,
    ":id"
  );

  // 2. 24-character hexadecimal IDs (MongoDB / ObjectIDs)
  path = path.replaceAll(/\b[0-9a-fA-F]{24}\b/gu, ":id");

  // 3. Entity-prefixed identifiers (parking-*, slot-*, rate-*, tenant-*, user-*, ticket-*)
  // Note: Avoid matching structural route segments like 'parking-lots'
  path = path.replaceAll(
    /\b(?:parking|tenant|slot|user|rate|ticket)-(?!lots\b)[a-zA-Z0-9_-]+\b/gu,
    ":id"
  );

  // 4. Vehicle license plate formats (e.g., ABC123, ABC-123, ABC12D)
  path = path.replaceAll(/\b[A-Za-z]{3}-?[0-9]{2}[0-9A-Za-z]\b/gu, ":id");

  // 5. Numeric path segments (e.g., /123/ or trailing /123)
  path = path.replaceAll(/\/\d+(?=\/|$)/gu, "/:id");

  // 6. Deduplicate multiple slashes
  path = path.replaceAll(/\/+/gu, "/");

  // 7. Strip trailing slash for consistency (unless root '/')
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path;
};

/**
 * Normalizes HTTP status code into low-cardinality category (4xx, 5xx, or unknown).
 */
export const categorizeHttpStatus = (statusCode?: number): string => {
  if (!isNumber(statusCode)) {
    return "unknown";
  }
  if (statusCode >= 500 && statusCode < 600) {
    return "5xx";
  }
  if (statusCode >= 400 && statusCode < 500) {
    return "4xx";
  }
  return `${Math.floor(statusCode / 100)}xx`;
};

/**
 * Normalizes error type token.
 */
export const normalizeErrorType = (
  errorType?: string,
  statusCategory?: string
): string => {
  if (errorType && errorType.trim().length > 0) {
    return errorType.trim().toLowerCase();
  }
  if (statusCategory === "5xx") {
    return "server_error";
  }
  if (statusCategory === "4xx") {
    return "client_error";
  }
  return "unknown_error";
};

/**
 * Enforces Engram Memory #988: strictly low-cardinality label filtering.
 */
export const filterLowCardinalityLabels = (labels: Record<string, string>) => {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(labels)) {
    const normalizedKey = key.toLowerCase().replaceAll(/[-_]/gu, "");
    if (FORBIDDEN_LABEL_KEYS.has(normalizedKey)) {
      continue;
    }
    result[key] =
      key === "route"
        ? sanitizeRoutePath(value)
        : value.replaceAll(/[\r\n]/gu, "");
  }

  return result;
};

@Injectable({
  providedIn: "root",
})
export class MetricsService implements OnDestroy {
  private readonly router = inject(Router, { optional: true });

  private readonly seriesMap = new Map<string, MetricSeries>();
  private readonly observers: PerformanceObserver[] = [];
  private navStartTime: number | null = null;

  constructor() {
    this.initRouterTracking();
    this.initWebVitalObservers();
  }

  private static serializeLabels(labels: Record<string, string>): string {
    const keys = Object.keys(labels).toSorted();
    if (keys.length === 0) {
      return "";
    }

    const pairs = keys.map((key) => {
      const val = (labels[key] ?? "")
        .replaceAll("\\", "\\\\")
        .replaceAll('"', '\\"')
        .replaceAll("\n", "\\n");
      return `${key}="${val}"`;
    });

    return `{${pairs.join(",")}}`;
  }

  /**
   * Tracks Core Web Vitals (LCP, CLS, INP, FID).
   */
  recordWebVital(
    metric: WebVitalMetric,
    value: number,
    targetRoute?: string
  ): void {
    const route = sanitizeRoutePath(
      targetRoute ?? this.getCurrentRouteTemplate()
    );
    const labels = filterLowCardinalityLabels({
      metric,
      route,
    });

    this.setGauge(
      "nivo_frontend_web_vitals",
      "Core Web Vitals measurement values",
      labels,
      value
    );
  }

  /**
   * Tracks route navigation duration in seconds.
   */
  recordNavigationDuration(route: string, durationSeconds: number): void {
    const sanitizedRoute = sanitizeRoutePath(route);
    const labels = filterLowCardinalityLabels({
      route: sanitizedRoute,
    });

    this.setGauge(
      "nivo_frontend_route_navigation_duration_seconds",
      "Navigation duration between routes in seconds",
      labels,
      durationSeconds
    );
  }

  /**
   * Tracks frontend API errors categorized into low-cardinality status tags (4xx, 5xx).
   */
  recordApiError(params: ApiErrorMetricParams): void {
    const statusCategory =
      params.statusCategory ?? categorizeHttpStatus(params.statusCode);
    const errorType = normalizeErrorType(params.errorType, statusCategory);
    const route = sanitizeRoutePath(
      params.route ?? this.getCurrentRouteTemplate()
    );

    const labels = filterLowCardinalityLabels({
      error_type: errorType,
      route,
      status_category: statusCategory,
    });

    this.incrementCounter(
      "nivo_frontend_api_errors_total",
      "Count of frontend API errors partitioned by status category",
      labels
    );
  }

  /**
   * Tracks SSE connection drops with low-cardinality error classifications.
   */
  recordSseDrop(params?: SseDropMetricParams): void {
    const errorType = normalizeErrorType(params?.errorType, "stream_drop");
    const route = sanitizeRoutePath(
      params?.route ?? this.getCurrentRouteTemplate()
    );

    const labels = filterLowCardinalityLabels({
      error_type: errorType,
      route,
    });

    this.incrementCounter(
      "nivo_frontend_sse_connection_drops_total",
      "Count of Server-Sent Events connection drops",
      labels
    );
  }

  /**
   * Resolves the current route path template from Angular Router snapshots.
   */
  getCurrentRouteTemplate(): string {
    if (!this.router || !this.router.routerState) {
      return "/";
    }

    let snapshot: ActivatedRouteSnapshot | null =
      this.router.routerState.snapshot.root;
    const segments: string[] = [];

    while (snapshot) {
      const path = snapshot.routeConfig?.path;
      if (path && path.length > 0) {
        segments.push(path);
      }
      snapshot = snapshot.firstChild;
    }

    const template = segments.length > 0 ? `/${segments.join("/")}` : "/";
    return sanitizeRoutePath(template);
  }

  /**
   * Returns current metrics formatted in Prometheus text exposition format (version 0.0.4).
   */
  getMetricsAsPrometheusText(): string {
    if (this.seriesMap.size === 0) {
      return "";
    }

    const grouped = new Map<string, MetricSeries[]>();
    for (const series of this.seriesMap.values()) {
      const list = grouped.get(series.name) ?? [];
      list.push(series);
      grouped.set(series.name, list);
    }

    const lines: string[] = [];
    const sortedMetricNames = [...grouped.keys()].toSorted();

    for (const metricName of sortedMetricNames) {
      const seriesList = grouped.get(metricName) ?? [];
      const [first] = seriesList;
      if (!first) {
        continue;
      }

      lines.push(
        `# HELP ${first.name} ${first.help}`,
        `# TYPE ${first.name} ${first.type}`
      );

      for (const item of seriesList) {
        const serializedLabels = MetricsService.serializeLabels(item.labels);
        lines.push(`${item.name}${serializedLabels} ${item.value}`);
      }
    }

    return `${lines.join("\n")}\n`;
  }

  /**
   * Returns a structured snapshot of stored metrics.
   */
  getMetricsSnapshot(): TelemetrySnapshot {
    const metrics: MetricSnapshotEntry[] = [];
    for (const item of this.seriesMap.values()) {
      metrics.push({
        labels: { ...item.labels },
        name: item.name,
        value: item.value,
      });
    }

    return {
      metrics,
      timestamp: Date.now(),
    };
  }

  /**
   * Flushes current metrics buffer to a client-side telemetry endpoint or Prometheus collector.
   */
  async flush(endpoint = "/api/v1/metrics/frontend"): Promise<boolean> {
    const text = this.getMetricsAsPrometheusText();
    if (!text.trim()) {
      return true;
    }

    if ("navigator" in globalThis && "sendBeacon" in navigator) {
      try {
        const blob = new Blob([text], {
          type: "text/plain; version=0.0.4; charset=utf-8",
        });
        const beaconSent = navigator.sendBeacon(endpoint, blob);
        if (beaconSent) {
          return true;
        }
      } catch {
        // Fall back to HTTP fetch
      }
    }

    if ("fetch" in globalThis) {
      try {
        const response = await fetch(endpoint, {
          body: text,
          headers: {
            "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
          },
          method: "POST",
        });
        return response.ok;
      } catch {
        return false;
      }
    }

    return false;
  }

  /**
   * Resets all internal metric buffers.
   */
  reset(): void {
    this.seriesMap.clear();
    this.navStartTime = null;
  }

  ngOnDestroy(): void {
    this.disconnectObservers();
    this.reset();
  }

  public disconnectObservers(): void {
    for (const observer of this.observers) {
      try {
        observer.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }
    this.observers.length = 0;
  }

  private incrementCounter(
    name: string,
    help: string,
    labels: Record<string, string>,
    incrementBy = 1
  ): void {
    const key = MetricsService.createSeriesKey(name, labels);
    const existing = this.seriesMap.get(key);
    const currentValue = existing ? existing.value : 0;

    this.seriesMap.set(key, {
      help,
      labels,
      name,
      type: "counter",
      value: currentValue + incrementBy,
    });
  }

  private setGauge(
    name: string,
    help: string,
    labels: Record<string, string>,
    value: number
  ): void {
    const key = MetricsService.createSeriesKey(name, labels);

    this.seriesMap.set(key, {
      help,
      labels,
      name,
      type: "gauge",
      value,
    });
  }

  private static createSeriesKey(
    name: string,
    labels: Record<string, string>
  ): string {
    const serializedLabels = MetricsService.serializeLabels(labels);
    return `${name}${serializedLabels}`;
  }

  private initRouterTracking(): void {
    if (!this.router) {
      return;
    }

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.navStartTime = performance.now();
      } else if (event instanceof NavigationEnd) {
        if (this.navStartTime !== null) {
          const durationSeconds =
            (performance.now() - this.navStartTime) / 1000;
          this.navStartTime = null;
          const route = this.getCurrentRouteTemplate();
          this.recordNavigationDuration(
            route,
            Number(durationSeconds.toFixed(3))
          );
        }
      } else if (
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.navStartTime = null;
      }
    });
  }

  private initWebVitalObservers(): void {
    if (!("window" in globalThis) || !("PerformanceObserver" in globalThis)) {
      return;
    }

    // 1. Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries.at(-1);
        if (lastEntry) {
          const seconds = lastEntry.startTime / 1000;
          this.recordWebVital("lcp", Number(seconds.toFixed(3)));
        }
      });
      lcpObserver.observe({ buffered: true, type: "largest-contentful-paint" });
      this.observers.push(lcpObserver);
    } catch {
      // Observer type not supported
    }

    // 2. Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          /* SAFETY: layout-shift PerformanceEntry contains hadRecentInput flag and value */
          const layoutEntry = entry as {
            hadRecentInput?: boolean;
            value?: number;
          };
          if (!layoutEntry.hadRecentInput && isNumber(layoutEntry.value)) {
            clsValue += layoutEntry.value;
          }
        }
        this.recordWebVital("cls", Number(clsValue.toFixed(4)));
      });
      clsObserver.observe({ buffered: true, type: "layout-shift" });
      this.observers.push(clsObserver);
    } catch {
      // Observer type not supported
    }

    // 3. First Input Delay (FID)
    try {
      const fidObserver = new PerformanceObserver((entryList) => {
        const [firstInput] = entryList.getEntries();
        if (firstInput) {
          /* SAFETY: first-input PerformanceEntry contains processingStart and startTime */
          const fidEntry = firstInput as {
            processingStart?: number;
            startTime: number;
          };
          if (isNumber(fidEntry.processingStart)) {
            const fidSeconds =
              (fidEntry.processingStart - fidEntry.startTime) / 1000;
            this.recordWebVital("fid", Number(fidSeconds.toFixed(3)));
          }
        }
      });
      fidObserver.observe({ buffered: true, type: "first-input" });
      this.observers.push(fidObserver);
    } catch {
      // Observer type not supported
    }

    // 4. Interaction to Next Paint (INP)
    try {
      let maxInteractionDuration = 0;
      const inpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          /* SAFETY: event PerformanceEntry contains duration in milliseconds */
          const eventEntry = entry as { duration?: number };
          if (
            isNumber(eventEntry.duration) &&
            eventEntry.duration > maxInteractionDuration
          ) {
            maxInteractionDuration = eventEntry.duration;
            this.recordWebVital(
              "inp",
              Number((maxInteractionDuration / 1000).toFixed(3))
            );
          }
        }
      });
      const inpOptions: ExtendedPerformanceObserverInit = {
        buffered: true,
        durationThreshold: 16,
        type: "event",
      };
      inpObserver.observe(inpOptions);
      this.observers.push(inpObserver);
    } catch {
      // Observer type not supported
    }
  }
}
