import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import {
  BadgeComponent,
  TypographyH2,
  TypographyP,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { PricingCardComponent } from "./pricing-card.component";
import type { PricingPlanItem } from "./pricing-card.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, TypographyH2, TypographyP, PricingCardComponent],
  selector: "app-pricing",
  standalone: true,
  templateUrl: "./pricing.component.html",
})
export class PricingComponent {
  protected readonly texts = APP_TEXTS.landing.pricing;

  readonly plans: readonly PricingPlanItem[] = [
    { ...this.texts.basic, isPopular: false },
    { ...this.texts.pro, isPopular: true },
    { ...this.texts.multiSite, isPopular: false },
  ];

  readonly registerClick = output();
}

export { PricingComponent as LandingPricingComponent };
