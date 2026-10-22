import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowRight } from "@ng-icons/lucide";
import {
  ButtonComponent,
  TypographyH2,
  TypographyP,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon, ButtonComponent, TypographyH2, TypographyP],
  providers: [
    provideIcons({
      lucideArrowRight,
    }),
  ],
  selector: "landing-footer",
  standalone: true,
  templateUrl: "./landing-footer.component.html",
})
export class LandingFooterComponent {
  protected readonly texts = APP_TEXTS.landing.footer;
  protected readonly ctaBannerTexts = APP_TEXTS.landing.ctaBanner;

  readonly ctaClick = output();
}
