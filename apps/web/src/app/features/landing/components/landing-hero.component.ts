import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowRight, lucideSparkles } from "@ng-icons/lucide";
import {
  ButtonComponent,
  CardComponent,
  TypographyH1,
  TypographyMuted,
  TypographyP,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    ButtonComponent,
    CardComponent,
    TypographyH1,
    TypographyP,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideArrowRight,
      lucideSparkles,
    }),
  ],
  selector: "landing-hero",
  standalone: true,
  templateUrl: "./landing-hero.component.html",
})
export class LandingHeroComponent {
  protected readonly texts = APP_TEXTS.landing.hero;

  readonly trySimulatorClick = output();
  readonly registerClick = output();
}
