import { afterNextRender, Component, ElementRef, input, OnDestroy, output, viewChild } from '@angular/core';
import { ButtonComponent, TypographyH3 } from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';
import { SlotStatus, SlotSummary } from '@core/models/slot.model';

@Component({
  selector: 'app-slot-status-modal',
  standalone: true,
  imports: [ButtonComponent, TypographyH3, NgIcon],
  providers: [provideIcons({ lucideX })],
  templateUrl: './slot-status-modal.html',
  styleUrl: './slot-status-modal.css',
})
export class SlotStatusModal implements OnDestroy {
  readonly title = input.required<string>();
  readonly body = input.required<string>();
  readonly target = input<SlotSummary | null>(null);
  readonly nextStatus = input<SlotStatus | null>(null);
  readonly transitionOptions = input.required<SlotStatus[]>();
  readonly requiresExtraConfirm = input.required<boolean>();
  readonly confirmChecked = input.required<boolean>();

  readonly confirm = output<void>();
  readonly cancel = output<void>();
  readonly selectStatusNext = output<SlotStatus>();
  readonly confirmCheckedChange = output<boolean>();

  protected readonly titleId = 'status-slot-title';
  protected readonly descriptionId = 'status-slot-description';

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>('dialog');

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
    const checked = (event.target as HTMLInputElement).checked;
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
