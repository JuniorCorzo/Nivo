import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  input,
  viewChild,
} from "@angular/core";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export interface HourlyOccupancyPoint {
  hourBucket: string;
  checkins: number;
  checkouts: number;
  totalCapacity: number;
  estimatedOccupancyRate: number;
}

@Component({
  selector: "app-occupancy-trend-chart",
  standalone: true,
  templateUrl: "./occupancy-trend-chart.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      return isNaN(date.getTime())
        ? p.hourBucket
        : `${date.getHours().toString().padStart(2, "0")}:00`;
    });
    const occupancyData = points.map((p) => p.estimatedOccupancyRate);
    const checkinData = points.map((p) => p.checkins);

    this.chartInstance = new Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "% Ocupación",
            data: occupancyData,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.3,
            yAxisID: "y",
          },
          {
            label: "Entradas",
            data: checkinData,
            borderColor: "rgb(16, 185, 129)",
            backgroundColor: "transparent",
            borderDash: [5, 5],
            tension: 0.3,
            yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            min: 0,
            max: 100,
            ticks: {
              callback: (v) => `${v}%`,
            },
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              precision: 0,
            },
          },
        },
      },
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}
