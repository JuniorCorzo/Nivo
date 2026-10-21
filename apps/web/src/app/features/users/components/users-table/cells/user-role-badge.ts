import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { Role } from "@core/type/role.type";
import { BadgeComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent],
  selector: "app-user-role-badge",
  standalone: true,
  template: `
    <nv-badge [class]="badgeClasses()">
      {{ label() }}
    </nv-badge>
  `,
})
export class UserRoleBadgeComponent {
  readonly role = input.required<Role>();

  readonly label = computed(() => {
    const texts = APP_TEXTS.users.table.roles;
    const roleLabels = {
      AUDITOR: texts.auditor,
      DRIVER: texts.driver,
      MANAGER: texts.manager,
      OPERATOR: texts.operator,
      OWNER: texts.owner,
      SUPERADMIN: texts.superadmin,
    } satisfies Record<Role, string>;
    return roleLabels[this.role()] ?? this.role();
  });

  readonly badgeClasses = computed(() => {
    const classesMap = {
      AUDITOR:
        "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-300",
      DRIVER:
        "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300",
      MANAGER:
        "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300",
      OPERATOR:
        "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300",
      OWNER:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
      SUPERADMIN:
        "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300",
    } satisfies Record<Role, string>;
    return (
      classesMap[this.role()] ??
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900 dark:text-slate-300"
    );
  });
}
