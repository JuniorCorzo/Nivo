import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTrash2 } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, NgIcon],
  providers: [provideIcons({ lucideTrash2 })],
  selector: "app-slot-batch-selection-bar",
  standalone: true,
  templateUrl: "./slot-batch-selection-bar.html",
})
export class SlotBatchSelectionBarComponent {
  readonly selectedCount = input.required<number>();

  readonly editMetadata = output();
  readonly deleteBatch = output();
}
