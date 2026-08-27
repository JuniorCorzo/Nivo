import {
  afterNextRender,
  Component,
  ElementRef,
  input,
  OnDestroy,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '@nivo-sass/design-system';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2, lucideX } from '@ng-icons/lucide';
import { RateModel } from '@core/models/rate.model';

@Component({
  selector: 'app-rate-delete-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent, NgIcon],
  providers: [provideIcons({ lucideX, lucideTrash2 })],
  templateUrl: './rate-delete-modal.html',
  styleUrl: './rate-delete-modal.css',
})
export class RateDeleteModal implements OnDestroy {
  readonly rate = input<RateModel | null>(null);
  readonly isDeleting = input<boolean>(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  protected readonly titleId = 'delete-rate-title';
  protected readonly descriptionId = 'delete-rate-description';

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
