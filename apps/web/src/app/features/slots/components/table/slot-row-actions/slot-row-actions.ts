import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideEye,
  lucidePencil,
  lucideToggleLeft,
  lucideTrash2,
} from "@ng-icons/lucide";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgIcon],
  providers: [
    provideIcons({
      lucideEye,
      lucidePencil,
      lucideToggleLeft,
      lucideTrash2,
    }),
  ],
  selector: "app-slot-row-actions",
  standalone: true,
  templateUrl: "./slot-row-actions.html",
})
export class SlotRowActionsComponent {
  readonly slot = input.required<SlotSummary>();

  readonly viewDetail = output<SlotSummary>();
  readonly edit = output<SlotSummary>();
  readonly changeStatus = output<SlotSummary>();
  readonly delete = output<SlotSummary>();
}
