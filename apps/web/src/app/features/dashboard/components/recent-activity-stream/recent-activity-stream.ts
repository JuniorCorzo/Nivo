import { CommonModule, DecimalPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import type { OperationalReportItemModel } from "@core/models/dashboard.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertTriangle,
  lucideArrowDownLeft,
  lucideArrowUpRight,
  lucideRadio,
} from "@ng-icons/lucide";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DecimalPipe, NgIcon],
  providers: [
    provideIcons({
      lucideAlertTriangle,
      lucideArrowDownLeft,
      lucideArrowUpRight,
      lucideRadio,
    }),
  ],
  selector: "app-recent-activity-stream",
  standalone: true,
  templateUrl: "./recent-activity-stream.html",
})
export class RecentActivityStreamComponent {
  readonly reports = input<OperationalReportItemModel[]>([]);

  formatTicketId(rawId: string): string {
    void this;
    if (!rawId) {
      return "TKT-0000";
    }
    const clean = rawId.replace("#", "");
    return clean.length > 8
      ? clean.slice(0, 8).toUpperCase()
      : clean.toUpperCase();
  }

  isEgress(item: OperationalReportItemModel): boolean {
    void this;
    const status = (item.ticketStatus || "").toUpperCase();
    return (
      Boolean(item.exitTime) ||
      status === "COMPLETED" ||
      status === "CLOSED" ||
      status === "FINALIZADO"
    );
  }

  isPending(item: OperationalReportItemModel): boolean {
    void this;
    const payStatus = (item.paymentStatus || "").toUpperCase();
    return (
      payStatus === "PENDING" ||
      payStatus === "EN COBRO" ||
      payStatus === "PENDIENTE"
    );
  }

  formatTime(item: OperationalReportItemModel): string {
    void this;
    const rawTime = item.exitTime || item.entryTime;
    if (!rawTime) {
      return "--:--:--";
    }
    const date = new Date(rawTime);
    if (Number.isNaN(date.getTime())) {
      return rawTime;
    }
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  formatDuration(mins?: number): string {
    void this;
    if (mins === undefined || mins === null || mins <= 0) {
      return "OK";
    }
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}
