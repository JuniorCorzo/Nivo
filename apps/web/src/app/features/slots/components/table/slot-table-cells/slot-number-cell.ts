import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-slot-number-cell",
  standalone: true,
  template: `
    <span
      class="font-mono text-sm font-bold"
      [class.text-foreground]="isActive()"
      [class.text-muted-foreground]="!isActive()"
    >
      {{ slotNumber() }}
    </span>
  `,
})
export class SlotNumberCellComponent {
  readonly slotNumber = input.required<string>();
  readonly isActive = input<boolean>(true);
}
