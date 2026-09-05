import type { ElementRef, OnDestroy } from "@angular/core";
import { afterNextRender, Component, output, viewChild } from "@angular/core";
import { ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  imports: [ButtonComponent],
  selector: "app-delete-parking-modal",
  standalone: true,
  styleUrl: "./delete-parking-modal.css",
  templateUrl: "./delete-parking-modal.html",
})
export class DeleteParkingModal implements OnDestroy {
  protected readonly LABELS = APP_TEXTS.parking.confirmations.delete;
  protected readonly titleId = "delete-parking-title";
  protected readonly descriptionId = "delete-parking-description";

  readonly confirm = output();
  readonly cancel = output();

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
