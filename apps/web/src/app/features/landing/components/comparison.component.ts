import { ChangeDetectionStrategy, Component } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheckCircle2, lucideXCircle } from "@ng-icons/lucide";
import {
  BadgeComponent,
  CardComponent,
  TypographyH2,
  TypographyH3,
  TypographyMuted,
  TypographyP,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    BadgeComponent,
    CardComponent,
    TypographyH2,
    TypographyH3,
    TypographyP,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideCheckCircle2,
      lucideXCircle,
    }),
  ],
  selector: "app-comparison",
  standalone: true,
  templateUrl: "./comparison.component.html",
})
export class ComparisonComponent {
  protected readonly texts = APP_TEXTS.landing.comparison;
}

export { ComparisonComponent as LandingComparisonComponent };
