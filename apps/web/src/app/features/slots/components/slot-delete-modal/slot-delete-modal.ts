import { afterNextRender, Component, ElementRef, input, OnDestroy, output, viewChild } from '@angular/core';
import { ButtonComponent, TypographyH3 } from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideX } from '@ng-icons/lucide';

@Component({
  selector: 'app-slot-delete-modal',
  standalone: true,
  imports: [ButtonComponent, TypographyH3, NgIcon],
  providers: [provideIcons({ lucideX })],
  templateUrl: './slot-delete-modal.html',
  styleUrl: './slot-delete-modal.css',
})
export class SlotDeleteModal implements OnDestroy {
  readonly copy = input.required<string>();
  readonly requiresConfirm = input.required<boolean>();
  readonly confirmChecked = input.required<boolean>();

  readonly confirm = output<void>();
  readonly cancel = output<void>();
  readonly confirmCheckedChange = output<boolean>();

  protected readonly titleId = 'delete-slot-title';
  protected readonly descriptionId = 'delete-slot-description';

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
