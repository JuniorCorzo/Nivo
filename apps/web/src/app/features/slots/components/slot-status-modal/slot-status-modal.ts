import type { ElementRef, OnDestroy } from "@angular/core";
import {
  afterNextRender,
  Component,
  input,
  output,
  viewChild,
} from "@angular/core";
import type { SlotStatus, SlotSummary } from "@core/models/slot.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideX } from "@ng-icons/lucide";
import { ButtonComponent, TypographyH3 } from "@nivo-sass/design-system";

@Component({
  imports: [ButtonComponent, TypographyH3, NgIcon],
  providers: [provideIcons({ lucideX })],
  selector: "app-slot-status-modal",
  standalone: true,
  styleUrl: "./slot-status-modal.css",
  templateUrl: "./slot-status-modal.html",
})
export class SlotStatusModal implements OnDestroy {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
  readonly target = input<SlotSummary | null>(null);
  readonly nextStatus = input<SlotStatus | null>(null);
  readonly transitionOptions = input.required<SlotStatus[]>();
  readonly requiresExtraConfirm = input.required<boolean>();
  readonly confirmChecked = input.required<boolean>();

  readonly confirm = output();
  readonly cancel = output();
  readonly selectStatusNext = output<SlotStatus>();
  readonly confirmCheckedChange = output<boolean>();

  protected readonly titleId = "status-slot-title";
  protected readonly descriptionId = "status-slot-description";

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>("dialog");

  constructor() {
    afterNextRender(() => {
      this.dialog()?.nativeElement.showModal();
    });
  }

  protected onCancel(event: Event): void {
    event.preventDefault();
    this.cancel.emit();
  }

  protected onConfirmCheckedChange(event: Event): void {
    /* SAFETY: Event target of checkbox input change is HTMLInputElement */
    const { checked } = event.target as HTMLInputElement;
    this.confirmCheckedChange.emit(checked);
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) {
      this.cancel.emit();
    }
  }

  ngOnDestroy(): void {
    const dialog = this.dialog()?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
  }
}
