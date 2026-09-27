import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  viewChild,
} from "@angular/core";
import type { HourlyOccupancyPointModel } from "@core/models/dashboard.model";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export type HourlyOccupancyPoint = HourlyOccupancyPointModel;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-occupancy-trend-chart",
  standalone: true,
  templateUrl: "./occupancy-trend-chart.html",
})
export class OccupancyTrendChartComponent implements OnDestroy {
  readonly data = input<HourlyOccupancyPoint[]>([]);

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>("canvasRef");
  chartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      const points = this.data();
      const canvasEl = this.canvasRef()?.nativeElement;
      if (canvasEl) {
        this.renderChart(canvasEl, points || []);
      }
    });
  }

  private renderChart(
    canvas: HTMLCanvasElement,
    points: HourlyOccupancyPoint[]
  ): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const labels = points.map((p) => {
      const date = new Date(p.hourBucket);
      return Number.isNaN(date.getTime())
        ? p.hourBucket
        : `${date.getHours().toString().padStart(2, "0")}:00`;
    });
    const occupancyData = points.map((p) => p.estimatedOccupancyRate);
    const checkinData = points.map((p) => p.checkins);

    this.chartInstance = new Chart(canvas, {
      data: {
        datasets: [
          {
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderColor: "rgb(59, 130, 246)",
            data: occupancyData,
            fill: true,
            label: "% Ocupación",
            tension: 0.3,
            yAxisID: "y",
          },
          {
            backgroundColor: "transparent",
            borderColor: "rgb(16, 185, 129)",
            borderDash: [5, 5],
            data: checkinData,
            label: "Entradas",
            tension: 0.3,
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
        responsive: true,
        scales: {
          y: {
            display: true,
            max: 100,
            min: 0,
            position: "left",
            ticks: {
              callback: (v) => `${v}%`,
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
