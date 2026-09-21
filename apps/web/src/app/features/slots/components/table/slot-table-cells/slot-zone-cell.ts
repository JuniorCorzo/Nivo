import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-slot-zone-cell",
  standalone: true,
  template: `
    <span
      class="bg-muted text-muted-foreground border-border inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold"
    >
      {{ displayZone() }}
    </span>
  `,
})
export class SlotZoneCellComponent {
  readonly zone = input<string | null>(null);

  readonly displayZone = computed(() => {
    const z = this.zone();
    return z && z.trim() !== "" ? z : "Sin zona";
  });
}
