import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { BadgeComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  selector: "app-user-status-badge",
  standalone: true,
  template: `
    <nv-badge [class]="badgeClasses()">
      {{ label() }}
    </nv-badge>
  `,
})
export class UserStatusBadgeComponent {
  readonly isActive = input.required<boolean>();

  readonly label = computed(() =>
    this.isActive()
      ? APP_TEXTS.users.table.status.active
      : APP_TEXTS.users.table.status.inactive
  );

  readonly badgeClasses = computed(() =>
    this.isActive()
      ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
      : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-400"
  );
}
