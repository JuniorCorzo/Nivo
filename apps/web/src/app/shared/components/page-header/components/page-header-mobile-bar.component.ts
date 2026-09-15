import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronLeft } from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";
import type { PageHeaderBadgeVariant } from "../page-header.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      lucideChevronLeft,
    }),
  ],
  selector: "app-page-header-mobile-bar",
  standalone: true,
  templateUrl: "./page-header-mobile-bar.component.html",
})
export class PageHeaderMobileBarComponent {
  readonly isRoot = input<boolean>(false);
  readonly backAriaLabel = input<string>("Volver");
  readonly mobilePath = input.required<string>();
  readonly badge = input<string | null>(null);
  readonly badgeVariant = input<PageHeaderBadgeVariant>("info");

  readonly back = output();
}
