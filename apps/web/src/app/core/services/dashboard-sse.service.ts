import type { OnDestroy } from "@angular/core";
import { inject, Injectable, signal } from "@angular/core";
import { ApiConfiguration } from "@core/api/generated/api-configuration";
import {
  isDashboardSummaryDto,
  mapToDashboardSummaryModel,
} from "@core/mappers/dashboard.mapper";
import type { DashboardSummaryModel } from "@core/models/dashboard.model";
import { AuthService } from "@core/services/auth-service";
import { MetricsService } from "@core/services/metrics.service";
import { Subject } from "rxjs";

const isStringPayload = (val: unknown): val is string =>
  Object.prototype.toString.call(val) === "[object String]";

@Injectable({
  providedIn: "root",
})
export class DashboardSseService implements OnDestroy {
  private readonly config = inject(ApiConfiguration);
  private readonly authService = inject(AuthService);
  private readonly metricsService = inject(MetricsService, { optional: true });

  private readonly _updates = signal<DashboardSummaryModel | null>(null);
  readonly updates = this._updates.asReadonly();

  readonly updates$ = new Subject<DashboardSummaryModel>();

  private abortController: AbortController | null = null;
  private retryCount = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;

  buildStreamUrl(parkingId?: string): string {
    const base = this.config.rootUrl.replace(/\/+$/u, "");
    const query = parkingId
      ? `?parkingId=${encodeURIComponent(parkingId)}`
      : "";
    return `${base}/dashboard/stream${query}`;
  }

  calculateBackoffDelay(retryCount?: number): number {
    const count = retryCount ?? this.retryCount;
    return Math.min(1000 * 2 ** count, 30_000);
  }

  handleSseMessage(eventName: string, data: unknown): void {
    if (!data) {
      return;
    }
    let payload = data;
    if (isStringPayload(payload)) {
      try {
        payload = JSON.parse(payload);
      } catch {
        return;
      }
    }

    const isSummaryEvent =
      eventName === "snapshot" ||
      eventName === "summary" ||
      eventName === "occupancy-update" ||
      eventName === "message";

    if (isSummaryEvent && isDashboardSummaryDto(payload)) {
      const model = mapToDashboardSummaryModel(payload);
      this._updates.set(model);
      this.updates$.next(model);
    }
  }

  async connect(parkingId?: string): Promise<void> {
    this.disconnect();

    const abortController = new AbortController();
    this.abortController = abortController;

    const url = this.buildStreamUrl(parkingId);
    const headers = new Headers();
    headers.set("Accept", "text/event-stream");

    const token = this.authService.accessTokenSignal();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    try {
      const response = await fetch(url, {
        headers,
        signal: abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`SSE HTTP error ${response.status}`);
      }

      this.retryCount = 0;
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      const readStreamChunks = async (): Promise<void> => {
        const chunk = await reader.read();
        if (chunk.done) {
          return;
        }
        buffer += decoder.decode(chunk.value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          this.parseSseBlock(block);
        }
        return readStreamChunks();
      };

      await readStreamChunks();
    } catch (error: unknown) {
      /* SAFETY: error could be an AbortError when manually disconnecting */
      const err = error as { name?: string };
      if (err.name === "AbortError" || abortController.signal.aborted) {
        return;
      }

      this.metricsService?.recordSseDrop({
        errorType: err.name || "stream_error",
      });

      const delay = this.calculateBackoffDelay(this.retryCount);
      this.retryCount += 1;
      this.reconnectTimeoutId = setTimeout(() => {
        if (!abortController.signal.aborted) {
          void this.connect(parkingId);
        }
      }, delay);
    }
  }

  private parseSseBlock(block: string): void {
    const lines = block.split("\n");
    let eventName = "message";
    let data = "";

    for (const line of lines) {
      if (line.startsWith("event:")) {
        eventName = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        data = line.slice(5).trim();
      }
    }

    if (data) {
      try {
        const json = JSON.parse(data);
        this.handleSseMessage(eventName, json);
      } catch {
        this.handleSseMessage(eventName, data);
      }
    }
  }

  disconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.retryCount = 0;
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.updates$.complete();
  }
}
