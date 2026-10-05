import { CommonModule } from "@angular/common";
import type { ElementRef, OnDestroy } from "@angular/core";
import {
  afterNextRender,
  Component,
  input,
  output,
  viewChild,
} from "@angular/core";
import type { RateModel } from "@core/models/rate.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideTrash2, lucideX } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";

@Component({
  imports: [CommonModule, ButtonComponent, NgIcon],
  providers: [provideIcons({ lucideTrash2, lucideX })],
  selector: "app-rate-delete-modal",
  standalone: true,
  styleUrl: "./rate-delete-modal.css",
  templateUrl: "./rate-delete-modal.html",
})
export class RateDeleteModal implements OnDestroy {
  readonly rate = input<RateModel | null>(null);
  readonly isDeleting = input<boolean>(false);

  readonly confirm = output();
  readonly cancel = output();

  protected readonly titleId = "delete-rate-title";
  protected readonly descriptionId = "delete-rate-description";

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
