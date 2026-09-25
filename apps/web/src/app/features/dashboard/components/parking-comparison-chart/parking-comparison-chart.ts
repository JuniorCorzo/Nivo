import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
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
  selector: "app-parking-comparison-chart",
  standalone: true,
  templateUrl: "./parking-comparison-chart.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "% Ocupación",
            data: occupancyRates,
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderColor: "rgba(59, 130, 246, 1)",
            borderWidth: 1,
            borderRadius: 6,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Ocupación: ${ctx.parsed.x}%`,
            },
          },
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            ticks: {
              callback: (value) => `${value}%`,
            },
          },
        },
        onClick: (_event, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            const clicked = items[index];
            if (clicked) {
              this.handleBarClick(clicked.parkingId);
            }
          }
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
