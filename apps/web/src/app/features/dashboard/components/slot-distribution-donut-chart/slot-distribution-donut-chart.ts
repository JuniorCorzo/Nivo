import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  viewChild,
} from "@angular/core";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-slot-distribution-donut-chart",
  standalone: true,
  templateUrl: "./slot-distribution-donut-chart.html",
})
export class SlotDistributionDonutChartComponent implements OnDestroy {
  readonly availableSlots = input<number>(0);
  readonly occupiedSlots = input<number>(0);

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>("canvasRef");
  chartInstance: Chart | null = null;

  constructor() {
    effect(() => {
      const available = this.availableSlots();
      const occupied = this.occupiedSlots();
      const canvasEl = this.canvasRef()?.nativeElement;
      if (canvasEl) {
        this.renderChart(canvasEl, occupied, available);
      }
    });
  }

  private renderChart(
    canvas: HTMLCanvasElement,
    occupied: number,
    available: number
  ): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    this.chartInstance = new Chart(canvas, {
      data: {
        datasets: [
          {
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)",
              "rgba(16, 185, 129, 0.8)",
            ],
            borderColor: ["rgb(59, 130, 246)", "rgb(16, 185, 129)"],
            borderWidth: 1,
            data: [occupied, available],
          },
        ],
        labels: ["Ocupadas", "Disponibles"],
      },
      options: {
        cutout: "70%",
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        responsive: true,
      },
      type: "doughnut",
    });
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }
  }
}
