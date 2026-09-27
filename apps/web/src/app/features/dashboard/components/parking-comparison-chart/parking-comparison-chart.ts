import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  viewChild,
} from "@angular/core";
import type { ParkingComparisonItemModel } from "@core/models/dashboard.model";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export type ParkingComparisonItem = ParkingComparisonItemModel;

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
      if (!items || items.length === 0) {
        if (this.chartInstance) {
          this.chartInstance.destroy();
          this.chartInstance = null;
        }
        return;
      }
      if (canvasEl) {
        this.renderChart(canvasEl, items);
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

    if (!items || items.length === 0) {
      return;
    }

    const labels = items.map((i) => i.parkingName);
    const occupancyRates = items.map((i) => i.occupancyRate);

    this.chartInstance = new Chart(canvas, {
      data: {
        datasets: [
          {
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            barPercentage: 0.65,
            borderColor: "rgba(59, 130, 246, 1)",
            borderRadius: 4,
            borderWidth: 1,
            categoryPercentage: 0.85,
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
              label: (ctx) => {
                const item = items[ctx.dataIndex];
                const count = item?.occupiedSlots ?? 0;
                const total = item?.totalSlots ?? 0;
                return ` Ocupación: ${ctx.parsed.x}% (${count} de ${total} plazas)`;
              },
            },
          },
        },
        responsive: true,
        scales: {
          x: {
            grid: {
              color: "rgba(156, 163, 175, 0.15)",
            },
            max: 100,
            min: 0,
            ticks: {
              callback: (value) => `${value}%`,
            },
          },
          y: {
            grid: {
              display: false,
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
