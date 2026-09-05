import type { ElementRef } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  viewChild,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  selector: "app-occuppation-meter",
  styleUrl: "./occuppation-meter.css",
  templateUrl: "./occuppation-meter.html",
})
export class OccuppationMeter {
  public id = input("occuppation-meter");
  public min = input("0");
  public max = input("100");
  public value = input("0");
  public low = input("33");
  public optimum = input("70");
  public high = input("90");

  public totalCapacity = input<number | string>();
  public occupiedSlots = input<number | string>();
  public showDetails = input(false);

  protected ratio = computed(() => {
    const maxVal = Number(this.max()) || 100;
    const computedRatio = Math.round((Number(this.value()) * 100) / maxVal);
    return Number.isNaN(computedRatio)
      ? 0
      : Math.min(100, Math.max(0, computedRatio));
  });

  protected occupied = computed(() => {
    if (
      this.occupiedSlots() !== undefined &&
      this.occupiedSlots() !== null &&
      this.occupiedSlots() !== ""
    ) {
      return Number(this.occupiedSlots());
    }
    const total = Number(this.totalCapacity()) || 0;
    const rate = Number(this.value()) || 0;
    return Math.round((total * rate) / 100);
  });

  private occuppationMeter =
    viewChild<ElementRef<HTMLDivElement>>("occuppation_meter");

  constructor() {
    effect(() => {
      this.occuppationMeter()?.nativeElement.style.setProperty(
        "--bar-width",
        `${this.ratio()}%`
      );
      this.occuppationMeter()?.nativeElement.style.setProperty(
        "--bar-background",
        this.getBarBackground()
      );
    });
  }

  private getBarBackground() {
    const ratio = this.ratio();
    switch (true) {
      case ratio > Math.trunc(Number(this.optimum())) &&
        ratio < Math.trunc(Number(this.high())): {
        return "var(--color-warning)";
      }
      case ratio > Math.trunc(Number(this.high())): {
        return "var(--color-error)";
      }
      default: {
        return "var(--color-success)";
      }
    }
  }
}
