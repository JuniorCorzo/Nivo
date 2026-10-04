import { CommonModule, DecimalPipe } from "@angular/common";
import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  viewChild,
} from "@angular/core";
import type { ParkingComparisonItemModel } from "@core/models/dashboard.model";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export type ParkingComparisonItem = ParkingComparisonItemModel;

export interface ThresholdBadgeInfo {
  classes: string;
  label: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe],
  selector: "app-parking-comparison-chart",
  standalone: true,
  templateUrl: "./parking-comparison-chart.html",
})
export class ParkingComparisonChartComponent implements OnDestroy {
  readonly data = input<ParkingComparisonItem[]>([]);
  readonly parkingSelected = output<string>();

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>("canvasRef");
  chartInstance: Chart | null = null;

  private readonly knownAddresses = {
    calle100: "Calle 100 # 19-45 • Bogotá",
    chapinero: "Cra 7 # 67-30 • Bogotá",
    laureles: "Av. Nutibara # 73-22 • Medellín",
    poblado: "Cra 43A # 1-50 • Medellín",
  } as const;

  readonly sortedData = computed(() => {
    const items = [...(this.data() || [])];
    return items.toSorted((a, b) => b.occupancyRate - a.occupancyRate);
  });

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

  getAddress(item: ParkingComparisonItem): string {
    const key = item.parkingId.toLowerCase();
    for (const [k, addr] of Object.entries(this.knownAddresses)) {
      if (key.includes(k) || item.parkingName.toLowerCase().includes(k)) {
        return addr;
      }
    }
    return `${item.parkingName} • Centro Operativo`;
  }

  getThresholdBadge(rate: number): ThresholdBadgeInfo {
    void this;
    if (rate >= 90) {
      return {
        classes: "bg-rose-500/15 text-rose-400 border border-rose-500/30",
        label: "CRÍTICO",
      };
    }
    if (rate >= 70) {
      return {
        classes: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
        label: "ALTA",
      };
    }
    return {
      classes:
        "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
      label: "NORMAL",
    };
  }

  getProgressBarClass(rate: number): string {
    void this;
    if (rate >= 90) {
      return "bg-rose-500";
    }
    if (rate >= 70) {
      return "bg-amber-500";
    }
    return "bg-emerald-500";
  }

  getRankBadgeClass(rate: number): string {
    void this;
    if (rate >= 90) {
      return "bg-rose-500/10 text-rose-500";
    }
    if (rate >= 70) {
      return "bg-amber-500/10 text-amber-500";
    }
    return "bg-emerald-500/10 text-emerald-500";
  }

  getClampedRate(rate: number): number {
    void this;
    return Math.min(Math.max(rate, 0), 100);
  }

  getAvailableSlots(item: ParkingComparisonItem): number {
    void this;
    return Math.max(item.totalSlots - item.occupiedSlots, 0);
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
    const backgroundColors = items.map((i) => {
      if (i.occupancyRate >= 90) {
        return "rgba(244, 63, 94, 0.75)";
      }
      if (i.occupancyRate >= 70) {
        return "rgba(245, 158, 11, 0.75)";
      }
      return "rgba(16, 185, 129, 0.75)";
    });
    const borderColors = items.map((i) => {
      if (i.occupancyRate >= 90) {
        return "rgb(244, 63, 94)";
      }
      if (i.occupancyRate >= 70) {
        return "rgb(245, 158, 11)";
      }
      return "rgb(16, 185, 129)";
    });

    this.chartInstance = new Chart(canvas, {
      data: {
        datasets: [
          {
            backgroundColor: backgroundColors,
            barPercentage: 0.65,
            borderColor: borderColors,
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
