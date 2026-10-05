import type { ElementRef, OnDestroy } from "@angular/core";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import type { SlotSummary } from "@core/models/slot.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertTriangle, lucideX } from "@ng-icons/lucide";
import { ButtonComponent, TypographyH3 } from "@nivo-sass/design-system";

export interface SlotMetadataBatchPayload {
  hasCharger?: boolean;
  isAccessible?: boolean;
  isActive?: boolean;
  slotIds: string[];
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, TypographyH3, NgIcon],
  providers: [provideIcons({ lucideAlertTriangle, lucideX })],
  selector: "app-slot-metadata-batch-modal",
  standalone: true,
  styleUrl: "./slot-metadata-batch-modal.css",
  templateUrl: "./slot-metadata-batch-modal.html",
})
export class SlotMetadataBatchModalComponent implements OnDestroy {
  readonly selectedSlots = input<SlotSummary[]>([]);

  readonly cancel = output();
  readonly submitMetadata = output<SlotMetadataBatchPayload>();

  readonly hasCharger = signal(false);
  readonly isAccessible = signal(false);
  readonly isActive = signal(true);

  readonly hasOccupiedSlots = computed(() =>
    this.selectedSlots().some((slot) => slot.status === "OCCUPIED")
  );

  readonly occupiedCount = computed(
    () =>
      this.selectedSlots().filter((slot) => slot.status === "OCCUPIED").length
  );

  readonly canSubmit = computed(
    () => !this.hasOccupiedSlots() && this.selectedSlots().length > 0
  );

  protected readonly titleId = "metadata-batch-title";
  protected readonly descriptionId = "metadata-batch-description";

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>("dialog");

  constructor() {
    afterNextRender(() => {
      this.dialog()?.nativeElement.showModal();
    });

    effect(() => {
      const slots = this.selectedSlots();
      if (slots.length > 0) {
        untracked(() => {
          this.hasCharger.set(slots.every((s) => s.hasCharger));
          this.isAccessible.set(slots.every((s) => s.isAccessible));
          this.isActive.set(slots.every((s) => s.isActive));
        });
      }
    });
  }

  onChargerChange(event: Event): void {
    /* SAFETY: event target of checkbox is HTMLInputElement */
    const { checked } = event.target as HTMLInputElement;
    this.hasCharger.set(checked);
  }

  onAccessibleChange(event: Event): void {
    /* SAFETY: event target of checkbox is HTMLInputElement */
    const { checked } = event.target as HTMLInputElement;
    this.isAccessible.set(checked);
  }

  onActiveChange(event: Event): void {
    /* SAFETY: event target of checkbox is HTMLInputElement */
    const { checked } = event.target as HTMLInputElement;
    this.isActive.set(checked);
  }

  onCancel(event?: Event): void {
    event?.preventDefault();
    this.cancel.emit();
  }

  protected onBackdropClick(event: MouseEvent): void {
    if (event.target === this.dialog()?.nativeElement) {
      this.cancel.emit();
    }
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      return;
    }
    this.submitMetadata.emit({
      hasCharger: this.hasCharger(),
      isAccessible: this.isAccessible(),
      isActive: this.isActive(),
      slotIds: this.selectedSlots().map((s) => s.id),
    });
  }

  ngOnDestroy(): void {
    const dialog = this.dialog()?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
  }
}
