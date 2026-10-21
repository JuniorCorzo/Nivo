import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { CheckboxComponent } from "@nivo-sass/design-system";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CheckboxComponent],
  selector: "app-slot-select-header",
  standalone: true,
  template: `
    <nv-checkbox
      [checked]="checked()"
      (change)="onToggle($event)"
      aria-label="Seleccionar todas las plazas"
    />
  `,
})
export class SlotSelectHeaderComponent {
  readonly checked = input<boolean>(false);
  readonly toggle = output<boolean>();

  onToggle(val: boolean): void {
    this.toggle.emit(val);
  }
}
