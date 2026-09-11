import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  HostListener,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideAlertTriangle, lucideLayers, lucideX } from "@ng-icons/lucide";
import {
  ButtonComponent,
  InputComponent,
  SelectComponent,
  TypographyH3,
} from "@nivo-sass/design-system";

export interface SlotGroupOption {
  count: number;
  occupiedCount: number;
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

export const displaySlotGroup = (g: SlotGroupOption): string => {
  const zoneLabel = g.zone ? `Zona ${g.zone}` : "Sin zona";
  const prefixLabel = g.prefix ? `Prefijo ${g.prefix}` : "Sin prefijo";
  const occupiedLabel =
    g.occupiedCount > 0
      ? ` · ${g.occupiedCount} ocupada${g.occupiedCount > 1 ? "s" : ""}`
      : "";
  return `${zoneLabel} · ${prefixLabel} (${g.count} plazas${occupiedLabel})`;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    InputComponent,
    SelectComponent,
    TypographyH3,
    NgIcon,
  ],
  providers: [provideIcons({ lucideAlertTriangle, lucideLayers, lucideX })],
  selector: "app-slot-group-edit-modal",
  standalone: true,
  styleUrl: "./slot-group-edit-modal.component.css",
  templateUrl: "./slot-group-edit-modal.component.html",
})
export class SlotGroupEditModalComponent {
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

  readonly hasOccupiedSlots = computed(
    () => (this.selectedGroup()?.occupiedCount ?? 0) > 0
  );

  readonly occupiedCount = computed(
    () => this.selectedGroup()?.occupiedCount ?? 0
  );

  readonly canSubmit = computed(
    () => this.hasChanges() && !this.hasOccupiedSlots()
  );

  protected readonly titleId = "slot-group-edit-title";
  protected readonly descriptionId = "slot-group-edit-description";

  @HostListener("document:keydown.escape", ["$event"])
  onKeydownEscape(event: Event): void {
    event.stopPropagation();
    this.cancel.emit();
  }

  constructor() {
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

  onGroupOptionSelect(group: SlotGroupOption): void {
    if (group) {
      this.selectedGroupKey.set(this.groupKey(group));
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
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
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
}
