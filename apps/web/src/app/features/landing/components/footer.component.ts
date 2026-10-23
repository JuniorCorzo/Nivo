import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
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
  selector: "app-footer",
  standalone: true,
  templateUrl: "./footer.component.html",
})
export class FooterComponent {
  protected readonly texts = APP_TEXTS.landing.footer;
  protected readonly ctaBannerTexts = APP_TEXTS.landing.ctaBanner;

  readonly accountCreationEnabled = input<boolean>(false);
  readonly ctaClick = output();
}

export { FooterComponent as LandingFooterComponent };
