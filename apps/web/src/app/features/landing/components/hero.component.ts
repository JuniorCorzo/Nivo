import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowRight, lucideSparkles } from "@ng-icons/lucide";
import {
  BadgeComponent,
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
    BadgeComponent,
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
  selector: "app-hero",
  standalone: true,
  templateUrl: "./hero.component.html",
})
export class HeroComponent {
  protected readonly texts = APP_TEXTS.landing.hero;

  readonly accountCreationEnabled = input<boolean>(false);
  readonly trySimulatorClick = output();
  readonly registerClick = output();
}

export { HeroComponent as LandingHeroComponent };
