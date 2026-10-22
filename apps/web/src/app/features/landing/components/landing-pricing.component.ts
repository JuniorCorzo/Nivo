import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import {
  BadgeComponent,
  TypographyH2,
  TypographyP,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import {
  LandingPricingCardComponent,
  type PricingPlanItem,
} from "./landing-pricing-card.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    TypographyH2,
    TypographyP,
    LandingPricingCardComponent,
  ],
  selector: "landing-pricing",
  standalone: true,
  templateUrl: "./landing-pricing.component.html",
})
export class LandingPricingComponent {
  protected readonly texts = APP_TEXTS.landing.pricing;

  readonly plans: readonly PricingPlanItem[] = [
    { ...this.texts.basic, isPopular: false },
    { ...this.texts.pro, isPopular: true },
    { ...this.texts.multiSite, isPopular: false },
  ];

  readonly registerClick = output<void>();
}
