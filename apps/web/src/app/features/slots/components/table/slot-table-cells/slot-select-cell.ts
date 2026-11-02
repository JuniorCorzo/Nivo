import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { CheckboxComponent } from "@nivo-sass/design-system";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CheckboxComponent],
  selector: "app-slot-select-cell",
  standalone: true,
  template: `
    <nv-checkbox
      [checked]="checked()"
      (checkedChange)="onToggle($event)"
      aria-label="Seleccionar plaza"
    />
  `,
})
export class SlotSelectCellComponent {
  readonly checked = input<boolean>(false);
  readonly toggleChange = output<boolean>();

  onToggle(val: boolean): void {
    this.toggleChange.emit(val);
  }
}
