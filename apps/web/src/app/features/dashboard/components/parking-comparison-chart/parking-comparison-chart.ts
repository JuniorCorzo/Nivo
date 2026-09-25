import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  viewChild,
} from "@angular/core";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export interface ParkingComparisonItem {
  parkingId: string;
  parkingName: string;
  totalSlots: number;
  occupiedSlots: number;
  occupancyRate: number;
  todayRevenue: number;
  activeTickets: number;
  avgStayMinutes: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-parking-comparison-chart",
  standalone: true,
  templateUrl: "./parking-comparison-chart.html",
})
export class ParkingComparisonChartComponent implements OnDestroy {
  readonly data = input<ParkingComparisonItem[]>([]);
  readonly parkingSelected = output<string>();

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>("canvasRef");
  chartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      const items = this.data();
      const canvasEl = this.canvasRef()?.nativeElement;
      if (canvasEl) {
        this.renderChart(canvasEl, items || []);
      }
    });
  }

  handleBarClick(parkingId: string): void {
    this.parkingSelected.emit(parkingId);
  }

  private renderChart(
    canvas: HTMLCanvasElement,
    items: ParkingComparisonItem[]
  ): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const labels = items.map((i) => i.parkingName);
    const occupancyRates = items.map((i) => i.occupancyRate);

    this.chartInstance = new Chart(canvas, {
      data: {
        datasets: [
          {
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderRadius: 6,
            borderWidth: 1,
            data: occupancyRates,
            label: "% Ocupación",
          },
        ],
        labels,
      },
      options: {
        indexAxis: "y",
        maintainAspectRatio: false,
        onClick: (_event, elements) => {
          const [firstElement] = elements;
          if (firstElement) {
            const { index } = firstElement;
            const clicked = items[index];
            if (clicked) {
              this.handleBarClick(clicked.parkingId);
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Ocupación: ${ctx.parsed.x}%`,
            },
          },
        },
        responsive: true,
        scales: {
          x: {
            max: 100,
            min: 0,
            ticks: {
              callback: (value) => `${value}%`,
            },
          },
        },
      },
      type: "bar",
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}
