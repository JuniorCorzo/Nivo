import { ChangeDetectionStrategy, Component } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCalculator,
  lucideQrCode,
  lucideShieldCheck,
  lucideSmartphone,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  CardComponent,
  TypographyH2,
  TypographyH4,
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
    TypographyH4,
    TypographyP,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideCalculator,
      lucideQrCode,
      lucideShieldCheck,
      lucideSmartphone,
    }),
  ],
  selector: "app-benefits",
  standalone: true,
  templateUrl: "./benefits.component.html",
})
export class BenefitsComponent {
  protected readonly texts = APP_TEXTS.landing.benefits;
}

export { BenefitsComponent as LandingBenefitsComponent };
