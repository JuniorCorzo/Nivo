import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-ticket-duration-cell",
  standalone: true,
  template: `
    <div class="flex flex-col gap-0.5">
      <span class="text-foreground font-mono text-xs font-semibold">
        {{ formattedDate() }}
      </span>
      <span class="text-muted-foreground text-[11px] font-medium">
        {{ elapsedText() }}
      </span>
    </div>
  `,
})
export class TicketDurationCellComponent {
  readonly entryTime = input<string | null | undefined>();
  readonly exitTime = input<string | null | undefined>();

  readonly formattedDate = computed(() => {
    const raw = this.entryTime();
    if (!raw) {
      return "---";
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      return "---";
    }
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  });

  readonly timeTag = computed(() => {
    const raw = this.entryTime();
    if (!raw) {
      return "---";
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      return "---";
    }
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  });

  readonly elapsedMinutes = computed(() => {
    const entryStr = this.entryTime();
    if (!entryStr) {
      return 0;
    }
    const start = new Date(entryStr).getTime();
    if (Number.isNaN(start)) {
      return 0;
    }
    const exitStr = this.exitTime();
    const end = exitStr ? new Date(exitStr).getTime() : Date.now();
    if (Number.isNaN(end)) {
      return 0;
    }
    return Math.max(0, Math.floor((end - start) / (1000 * 60)));
  });

  readonly elapsedText = computed(() => {
    const entryStr = this.entryTime();
    if (!entryStr) {
      return "---";
    }
    const start = new Date(entryStr).getTime();
    if (Number.isNaN(start)) {
      return "---";
    }

    const totalMin = this.elapsedMinutes();
    const hours = Math.floor(totalMin / 60);
    const minutes = totalMin % 60;

    if (this.exitTime()) {
      if (hours === 0) {
        return `${minutes} min total`;
      }
      if (minutes === 0) {
        return `${hours}h total`;
      }
      return `${hours}h ${minutes} min total`;
    }

    if (hours === 0) {
      return `Hace ${minutes} min`;
    }
    if (minutes === 0) {
      return `Hace ${hours}h`;
    }
    return `Hace ${hours}h ${minutes} min`;
  });
}
