import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  selector: "app-ticket-duration-cell",
  standalone: true,
  template: `
    <div class="flex min-w-[130px] flex-col gap-1">
      <div class="flex items-center justify-between text-xs">
        <span [class]="durationColorClass()">{{ elapsedText() }}</span>
        <span class="text-muted-foreground font-mono text-[11px]">{{
          timeTag()
        }}</span>
      </div>
      <div class="bg-muted mt-1 h-1 w-24 overflow-hidden rounded-full">
        <div
          class="h-full rounded-full transition-all duration-300"
          [style.width.%]="progressPercent()"
          [class]="barColorClass()"
        ></div>
      </div>
    </div>
  `,
})
export class TicketDurationCellComponent {
  readonly entryTime = input<string | null | undefined>();
  readonly exitTime = input<string | null | undefined>();

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

  readonly isUnderFourHours = computed(() => this.elapsedMinutes() < 4 * 60);
  readonly isOverEightHours = computed(() => this.elapsedMinutes() >= 8 * 60);

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

  readonly durationColorClass = computed(() => {
    if (this.exitTime()) {
      return "text-muted-foreground font-semibold";
    }
    if (this.isUnderFourHours()) {
      return "text-emerald-500 dark:text-emerald-400 font-semibold";
    }
    if (this.isOverEightHours()) {
      return "text-amber-500 dark:text-amber-400 font-semibold";
    }
    return "text-foreground font-semibold";
  });

  readonly progressPercent = computed(() => {
    if (this.exitTime()) {
      return 100;
    }
    // Scale against 8 hours (480 min)
    return Math.min(
      100,
      Math.max(8, Math.round((this.elapsedMinutes() / 480) * 100))
    );
  });

  readonly barColorClass = computed(() => {
    if (this.exitTime()) {
      return "bg-sky-500";
    }
    if (this.isUnderFourHours()) {
      return "bg-emerald-500";
    }
    if (this.isOverEightHours()) {
      return "bg-amber-500";
    }
    return "bg-amber-400";
  });
}
