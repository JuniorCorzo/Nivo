import type { ElementRef, OnDestroy } from "@angular/core";
import {
  afterNextRender,
  Component,
  input,
  output,
  viewChild,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideX } from "@ng-icons/lucide";
import { ButtonComponent, TypographyH3 } from "@nivo-sass/design-system";

@Component({
  imports: [ButtonComponent, TypographyH3, NgIcon],
  providers: [provideIcons({ lucideX })],
  selector: "app-slot-delete-modal",
  standalone: true,
  styleUrl: "./slot-delete-modal.css",
  templateUrl: "./slot-delete-modal.html",
})
export class SlotDeleteModal implements OnDestroy {
  readonly copy = input.required<string>();
  readonly requiresConfirm = input.required<boolean>();
  readonly confirmChecked = input.required<boolean>();

  readonly confirm = output();
  readonly cancel = output();
  readonly confirmCheckedChange = output<boolean>();

  protected readonly titleId = "delete-slot-title";
  protected readonly descriptionId = "delete-slot-description";

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
