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
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideX } from "@ng-icons/lucide";
import {
  ButtonComponent,
  InputComponent,
  TypographyH3,
} from "@nivo-sass/design-system";

export interface UpdateSlotGroupPayload {
  currentPrefix: string;
  currentZone: string;
  newPrefix?: string;
  newZone?: string;
  parkingId: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, InputComponent, TypographyH3, NgIcon],
  providers: [provideIcons({ lucideX })],
  selector: "app-slot-group-edit-modal",
  standalone: true,
  styleUrl: "./slot-group-edit-modal.component.css",
  templateUrl: "./slot-group-edit-modal.component.html",
})
export class SlotGroupEditModalComponent implements OnDestroy {
  readonly currentZone = input<string>("");
  readonly currentPrefix = input<string>("");
  readonly parkingId = input.required<string>();

  readonly cancel = output();
  readonly submitGroup = output<UpdateSlotGroupPayload>();

  readonly newZone = signal<string>("");
  readonly newPrefix = signal<string>("");

  readonly hasChanges = computed(() => {
    const z = this.newZone().trim();
    const p = this.newPrefix().trim();
    const curZ = this.currentZone().trim();
    const curP = this.currentPrefix().trim();

    const changed = z !== curZ || p !== curP;
    const nonEmpty = z.length > 0 || p.length > 0;
    return changed && nonEmpty;
  });

  protected readonly titleId = "slot-group-edit-title";
  protected readonly descriptionId = "slot-group-edit-description";

  private readonly dialog = viewChild<ElementRef<HTMLDialogElement>>("dialog");

  constructor() {
    afterNextRender(() => {
      this.dialog()?.nativeElement.showModal();
    });

    effect(() => {
      const zone = this.currentZone();
      const prefix = this.currentPrefix();
      untracked(() => {
        this.newZone.set(zone);
        this.newPrefix.set(prefix);
      });
    });
  }

  onZoneInput(event: Event): void {
    /* SAFETY: event target of input is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.newZone.set(target.value);
  }

  onPrefixInput(event: Event): void {
    /* SAFETY: event target of input is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.newPrefix.set(target.value);
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
    if (!this.hasChanges()) {
      return;
    }

    const z = this.newZone().trim();
    const p = this.newPrefix().trim();

    const payload: UpdateSlotGroupPayload = {
      currentPrefix: this.currentPrefix(),
      currentZone: this.currentZone(),
      parkingId: this.parkingId(),
    };

    if (z !== this.currentZone()) {
      payload.newZone = z;
    }

    if (p !== this.currentPrefix()) {
      payload.newPrefix = p;
    }

    this.submitGroup.emit(payload);
  }

  ngOnDestroy(): void {
    const dialog = this.dialog()?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
  }
}
