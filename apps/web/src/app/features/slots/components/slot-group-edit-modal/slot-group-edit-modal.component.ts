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
import { lucideLayers, lucideX } from "@ng-icons/lucide";
import {
  ButtonComponent,
  InputComponent,
  SelectComponent,
  TypographyH3,
} from "@nivo-sass/design-system";

export interface SlotGroupOption {
  count: number;
  prefix: string;
  zone: string;
}

export interface UpdateSlotGroupPayload {
  currentPrefix: string;
  currentZone: string;
  newPrefix?: string;
  newZone?: string;
  parkingId: string;
}

export const slotGroupKey = (g: SlotGroupOption): string =>
  `${g.zone}:::${g.prefix}`;

export const displaySlotGroup = (g: SlotGroupOption): string =>
  `${g.zone ? `Zona ${g.zone}` : "Sin zona"} · ${g.prefix ? `Prefijo ${g.prefix}` : "Sin prefijo"} (${g.count} plazas)`;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TypographyH3,
    NgIcon,
  ],
  providers: [provideIcons({ lucideLayers, lucideX })],
  selector: "app-slot-group-edit-modal",
  standalone: true,
  styleUrl: "./slot-group-edit-modal.component.css",
  templateUrl: "./slot-group-edit-modal.component.html",
})
export class SlotGroupEditModalComponent implements OnDestroy {
  readonly groups = input<SlotGroupOption[]>([]);
  readonly initialZone = input<string>("");
  readonly initialPrefix = input<string>("");
  readonly parkingId = input.required<string>();

  readonly cancel = output();
  readonly submitGroup = output<UpdateSlotGroupPayload>();

  readonly selectedGroupKey = signal<string>("");
  readonly newZone = signal<string>("");
  readonly newPrefix = signal<string>("");

  readonly groupKey = slotGroupKey;
  readonly displayGroup = displaySlotGroup;

  readonly selectedGroup = computed<SlotGroupOption | null>(() => {
    const key = this.selectedGroupKey();
    if (!key) {
      return null;
    }
    return this.groups().find((g) => this.groupKey(g) === key) ?? null;
  });

  readonly hasChanges = computed(() => {
    const group = this.selectedGroup();
    if (!group) {
      return false;
    }
    const z = this.newZone().trim();
    const p = this.newPrefix().trim();
    const curZ = group.zone.trim();
    const curP = group.prefix.trim();

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
      const groups = this.groups();
      const initZ = this.initialZone();
      const initP = this.initialPrefix();

      untracked(() => {
        if (initZ || initP) {
          const match = groups.find(
            (g) => g.zone === initZ && g.prefix === initP
          );
          if (match) {
            this.onGroupSelect(this.groupKey(match));
            return;
          }
        }
        if (groups.length === 1) {
          this.onGroupSelect(this.groupKey(groups[0]));
        }
      });
    });
  }

  onGroupSelect(key: string): void {
    this.selectedGroupKey.set(key);
    const group = this.groups().find((g) => this.groupKey(g) === key);
    if (group) {
      this.newZone.set(group.zone);
      this.newPrefix.set(group.prefix);
    }
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

    const group = this.selectedGroup();
    if (!group) {
      return;
    }

    this.submitGroup.emit({
      currentPrefix: group.prefix,
      currentZone: group.zone,
      newPrefix: this.newPrefix().trim() || undefined,
      newZone: this.newZone().trim() || undefined,
      parkingId: this.parkingId(),
    });
  }

  ngOnDestroy(): void {
    const dialog = this.dialog()?.nativeElement;
    if (dialog?.open) {
      dialog.close();
    }
  }
}
