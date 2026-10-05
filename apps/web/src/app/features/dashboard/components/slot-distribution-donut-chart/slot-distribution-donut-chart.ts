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
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

export interface SlotCategoryItem {
  id: string;
  name: string;
  color: string;
  occupied: number;
  total: number;
  percentage: number;
}

const calculateCategoryPercentage = (occ: number, tot: number): number =>
  tot > 0 ? Number(((occ / tot) * 100).toFixed(1)) : 0;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe],
  selector: "app-slot-distribution-donut-chart",
  standalone: true,
  templateUrl: "./slot-distribution-donut-chart.html",
})
export class SlotDistributionDonutChartComponent implements OnDestroy {
  readonly availableSlots = input<number>(0);
  readonly occupiedSlots = input<number>(0);
  readonly categories = input<SlotCategoryItem[] | null>(null);

  readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>("canvasRef");
  chartInstance: Chart | null = null;

  readonly totalSlots = computed(
    () => this.occupiedSlots() + this.availableSlots()
  );

  readonly resolvedCategories = computed<SlotCategoryItem[]>(() => {
    const inputCats = this.categories();
    if (inputCats && inputCats.length > 0) {
      return inputCats;
    }

    const occupied = this.occupiedSlots();
    const total = this.totalSlots();

    if (total <= 0) {
      return [
        {
          color: "#fafafa",
          id: "car",
          name: "Automóviles",
          occupied: 0,
          percentage: 0,
          total: 0,
        },
        {
          color: "#3b82f6",
          id: "moto",
          name: "Motocicletas",
          occupied: 0,
          percentage: 0,
          total: 0,
        },
        {
          color: "#22c55e",
          id: "bike",
          name: "Bicicletas",
          occupied: 0,
          percentage: 0,
          total: 0,
        },
        {
          color: "#eab308",
          id: "ev",
          name: "Carga Eléctrica / VIP",
          occupied: 0,
          percentage: 0,
          total: 0,
        },
      ];
    }

    const carTotal = Math.max(Math.round(total * 0.64), 1);
    const motoTotal = Math.max(Math.round(total * 0.24), 1);
    const bikeTotal = Math.max(Math.round(total * 0.08), 1);
    const evTotal = Math.max(total - carTotal - motoTotal - bikeTotal, 0);

    const carOcc = Math.min(Math.round(occupied * (260 / 392)), carTotal);
    const motoOcc = Math.min(Math.round(occupied * (95 / 392)), motoTotal);
    const bikeOcc = Math.min(Math.round(occupied * (22 / 392)), bikeTotal);
    const evOcc = Math.min(
      Math.max(occupied - carOcc - motoOcc - bikeOcc, 0),
      evTotal
    );

    return [
      {
        color: "#fafafa",
        id: "car",
        name: "Automóviles",
        occupied: carOcc,
        percentage: calculateCategoryPercentage(carOcc, carTotal),
        total: carTotal,
      },
      {
        color: "#3b82f6",
        id: "moto",
        name: "Motocicletas",
        occupied: motoOcc,
        percentage: calculateCategoryPercentage(motoOcc, motoTotal),
        total: motoTotal,
      },
      {
        color: "#22c55e",
        id: "bike",
        name: "Bicicletas",
        occupied: bikeOcc,
        percentage: calculateCategoryPercentage(bikeOcc, bikeTotal),
        total: bikeTotal,
      },
      {
        color: "#eab308",
        id: "ev",
        name: "Carga Eléctrica / VIP",
        occupied: evOcc,
        percentage: calculateCategoryPercentage(evOcc, evTotal),
        total: evTotal,
      },
    ];
  });

  constructor() {
    effect(() => {
      const cats = this.resolvedCategories();
      const canvasEl = this.canvasRef()?.nativeElement;
      if (canvasEl) {
        this.renderChart(canvasEl, cats);
      }
    });
  }

  private renderChart(
    canvas: HTMLCanvasElement,
    categories: SlotCategoryItem[]
  ): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = null;
    }

    const data = categories.map((c) => c.occupied);
    const labels = categories.map((c) => c.name);
    const backgroundColor = categories.map((c) => c.color);

    this.chartInstance = new Chart(canvas, {
      data: {
        datasets: [
          {
            backgroundColor,
            borderColor: "#09090b",
            borderWidth: 4,
            data,
            hoverOffset: 4,
          },
        ],
        labels,
      },
      options: {
        cutout: "76%",
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#18181b",
            bodyColor: "#a1a1aa",
            borderColor: "#27272a",
            borderWidth: 1,
            padding: 10,
            titleColor: "#fafafa",
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
