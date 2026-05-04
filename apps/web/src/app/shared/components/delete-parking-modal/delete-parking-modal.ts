import { afterNextRender, Component, ElementRef, OnDestroy, output, viewChild } from '@angular/core';
import { ButtonComponent } from '@nivo-sass/design-system';
import { APP_TEXTS } from '@shared/constants/app-texts.constant';

@Component({
  selector: 'app-delete-parking-modal',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './delete-parking-modal.html',
  styleUrl: './delete-parking-modal.css',
})
export class DeleteParkingModal implements OnDestroy {
  protected readonly LABELS = APP_TEXTS.parking.confirmations.delete;
  protected readonly titleId = 'delete-parking-title';
  protected readonly descriptionId = 'delete-parking-description';

  readonly confirm = output<void>();
  readonly cancel = output<void>();

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
