import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";
import {
  BadgeComponent,
  ButtonComponent,
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
    ButtonComponent,
    CardComponent,
    TypographyH2,
    TypographyH3,
    TypographyP,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideCheck,
    }),
  ],
  selector: "app-landing-pricing",
  standalone: true,
  templateUrl: "./landing-pricing.component.html",
})
export class LandingPricingComponent {
  protected readonly texts = APP_TEXTS.landing.pricing;

  readonly registerClick = output();
}
