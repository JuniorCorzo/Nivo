import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideShield, lucideShieldCheck, lucideUserX, lucideUsers } from "@ng-icons/lucide";
import { CardComponent, CardContentComponent, TypographyMuted } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block w-full",
  },
  imports: [CardComponent, CardContentComponent, NgIcon, TypographyMuted],
  providers: [
    provideIcons({
      lucideShield,
      lucideShieldCheck,
      lucideUserX,
      lucideUsers,
    }),
  ],
  selector: "app-users-kpi-grid",
  standalone: true,
  templateUrl: "./users-kpi-grid.html",
})
export class UsersKpiGridComponent {
  readonly total = input.required<number>();
  readonly activeOperators = input.required<number>();
  readonly managers = input.required<number>();
  readonly deactivated = input.required<number>();

  readonly texts = APP_TEXTS.users.kpis;
}
