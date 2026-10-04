import { DecimalPipe } from "@angular/common";
import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  viewChild,
} from "@angular/core";
import type { HourlyOccupancyPointModel } from "@core/models/dashboard.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTrendingUp } from "@ng-icons/lucide";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { Chart, registerables } from "chart.js";

import type { TimeGranularity } from "../../facade/dashboard.facade";

Chart.register(...registerables);

export type HourlyOccupancyPoint = HourlyOccupancyPointModel;

interface DisplayPoint {
  checkins: number;
  checkouts: number;
  label: string;
  occupancyRate: number;
  rawKey: string;
}

const SPANISH_MONTH_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const formatDayLabel = (dateStr: string): string => {
  if (dateStr.includes("T")) {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      return `${d.getUTCDate()} ${SPANISH_MONTH_SHORT[d.getUTCMonth()]}`;
    }
  }
  const parts = dateStr.split("-");
  if (parts.length >= 3) {
    const day = Math.trunc(Number(parts[2] ?? ""));
    const month = Math.trunc(Number(parts[1] ?? "")) - 1;
    if (!Number.isNaN(day) && month >= 0 && month < 12) {
      return `${day} ${SPANISH_MONTH_SHORT[month]}`;
    }
  }
  return dateStr;
};

const formatHourLabel = (hourBucket: string): string => {
  const date = new Date(hourBucket);
  if (Number.isNaN(date.getTime())) {
    return hourBucket;
  }
  return `${date.getHours().toString().padStart(2, "0")}:00`;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, NgIcon],
  providers: [provideIcons({ lucideTrendingUp })],
  selector: "app-occupancy-trend-chart",
  standalone: true,
  templateUrl: "./occupancy-trend-chart.html",
})
export class OccupancyTrendChartComponent implements OnDestroy {
  readonly data = input<HourlyOccupancyPoint[]>([]);
  readonly timeGranularity = input<TimeGranularity>("today");

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>("canvasRef");
  chartInstance: Chart | null = null;
  protected readonly texts = APP_TEXTS.dashboard.chart;

  readonly displayPoints = computed<DisplayPoint[]>(() => {
    const points = this.data();
    if (!points || points.length === 0) {
      return [];
    }

    const granularity = this.timeGranularity();
    if (granularity === "7days" || granularity === "30days") {
      const dayMap = new Map<
        string,
        {
          checkins: number;
          checkouts: number;
          count: number;
          totalOccupancy: number;
        }
      >();

      for (const p of points) {
        const dayKey = p.hourBucket.includes("T")
          ? (p.hourBucket.split("T")[0] ?? p.hourBucket)
          : p.hourBucket.slice(0, 10);
        const existing = dayMap.get(dayKey);
        const checkins = p.checkins ?? 0;
        const checkouts = p.checkouts ?? 0;
        const occ = p.estimatedOccupancyRate ?? 0;

        if (existing) {
          existing.checkins += checkins;
          existing.checkouts += checkouts;
          existing.totalOccupancy += occ;
          existing.count += 1;
        } else {
          dayMap.set(dayKey, {
            checkins,
            checkouts,
            count: 1,
            totalOccupancy: occ,
          });
        }
      }

      return [...dayMap.entries()].map(([dayKey, group]) => {
        const avgOccupancy =
          Math.round((group.totalOccupancy / group.count) * 10) / 10;
        return {
          checkins: group.checkins,
          checkouts: group.checkouts,
          label: formatDayLabel(dayKey),
          occupancyRate: avgOccupancy,
          rawKey: dayKey,
        };
      });
    }

    return points.map((p) => ({
      checkins: p.checkins ?? 0,
      checkouts: p.checkouts ?? 0,
      label: formatHourLabel(p.hourBucket),
      occupancyRate: p.estimatedOccupancyRate ?? 0,
      rawKey: p.hourBucket,
    }));
  });

  readonly peakLabel = computed(() =>
    this.timeGranularity() === "today"
      ? this.texts.peakHourIngress
      : this.texts.peakDayIngress
  );

  readonly peakIngressValue = computed(() => {
    const points = this.displayPoints();
    if (!points || points.length === 0) {
      return this.texts.noData;
    }
    let [peak] = points;
    for (const p of points) {
      if (p.checkins > (peak?.checkins ?? 0)) {
        peak = p;
      }
    }
    if (!peak) {
      return this.texts.noData;
    }
    const unit =
      this.timeGranularity() === "today"
        ? this.texts.unitVehPerHour
        : this.texts.unitVeh;
    return `${peak.label} (${peak.checkins} ${unit})`;
  });

  readonly peakOccupancyRate = computed(() => {
    const points = this.displayPoints();
    if (!points || points.length === 0) {
      return "0.0%";
    }
    const maxRate = Math.max(...points.map((p) => p.occupancyRate));
    return `${maxRate.toFixed(1)}%`;
  });

  readonly totalCheckins = computed(() => {
    const points = this.displayPoints();
    if (!points || points.length === 0) {
      return 0;
    }
    return points.reduce((acc, p) => acc + p.checkins, 0);
  });

  constructor() {
    effect(() => {
      const points = this.displayPoints();
      const canvasEl = this.canvasRef()?.nativeElement;
      if (canvasEl && points.length > 0) {
        this.renderChart(canvasEl, points);
      } else if (this.chartInstance) {
        this.chartInstance.destroy();
        this.chartInstance = null;
      }
    });
  }

  private renderChart(canvas: HTMLCanvasElement, points: DisplayPoint[]): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const labels = points.map((p) => p.label);
    const occupancyData = points.map((p) => p.occupancyRate);
    const checkinData = points.map((p) => p.checkins);
    const checkoutData = points.map((p) => p.checkouts);

    this.chartInstance = new Chart(canvas, {
      data: {
        datasets: [
          {
            backgroundColor: "rgba(59, 130, 246, 0.12)",
            borderColor: "rgb(59, 130, 246)",
            borderWidth: 2,
            data: occupancyData,
            fill: true,
            label: `% ${this.texts.legendOccupancy}`,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointHoverRadius: 5,
            pointRadius: 3,
            tension: 0.35,
            yAxisID: "y",
          },
          {
            backgroundColor: "transparent",
            borderColor: "rgb(16, 185, 129)",
            borderDash: [5, 5],
            borderWidth: 1.5,
            data: checkinData,
            label: this.texts.entries,
            pointBackgroundColor: "rgb(16, 185, 129)",
            pointHoverRadius: 4,
            pointRadius: 2,
            tension: 0.35,
            yAxisID: "y1",
          },
          {
            backgroundColor: "transparent",
            borderColor: "rgb(161, 161, 170)",
            borderDash: [3, 3],
            borderWidth: 1.5,
            data: checkoutData,
            label: this.texts.exits,
            pointBackgroundColor: "rgb(161, 161, 170)",
            pointHoverRadius: 4,
            pointRadius: 2,
            tension: 0.35,
            yAxisID: "y1",
          },
        ],
        labels,
      },
      options: {
        interaction: {
          intersect: false,
          mode: "index",
        },
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        responsive: true,
        scales: {
          y: {
            display: true,
            grid: {
              color: "rgba(39, 39, 42, 0.5)",
            },
            max: 100,
            min: 0,
            position: "left",
            ticks: {
              callback: (v) => `${v}%`,
              color: "#a1a1aa",
              font: {
                family: "JetBrains Mono",
                size: 11,
              },
            },
            type: "linear",
          },
          y1: {
            display: true,
            grid: {
              drawOnChartArea: false,
            },
            position: "right",
            ticks: {
              color: "#71717a",
              font: {
                family: "JetBrains Mono",
                size: 10,
              },
              precision: 0,
            },
            type: "linear",
          },
        },
      },
      type: "line",
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}
