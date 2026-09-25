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

@Component({
  selector: "app-slot-distribution-donut-chart",
  standalone: true,
  templateUrl: "./slot-distribution-donut-chart.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      type: "doughnut",
      data: {
        labels: ["Ocupadas", "Disponibles"],
        datasets: [
          {
            data: [occupied, available],
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)",
              "rgba(16, 185, 129, 0.8)",
            ],
            borderColor: ["rgb(59, 130, 246)", "rgb(16, 185, 129)"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        cutout: "70%",
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
