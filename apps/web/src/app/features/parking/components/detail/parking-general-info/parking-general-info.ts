import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideClock,
  lucideCoins,
  lucideMapPin,
  lucideNavigation,
  lucideReceipt,
  lucideTimer,
} from "@ng-icons/lucide";
import {
  BadgeComponent,
  CardComponent,
  TypographyH2,
  TypographyH3,
  TypographyMono,
  TypographyMuted,
  TypographySpan,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { formatDuration } from "@shared/utils/duration.utils";
import { formatIvaRate } from "@shared/utils/percentage.utils";
import { formatPrice } from "@shared/utils/price.utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    CardComponent,
    NgIcon,
    TypographyH2,
    TypographyH3,
    TypographyMono,
    TypographyMuted,
    TypographySpan,
  ],
  providers: [
    provideIcons({
      lucideClock,
      lucideCoins,
      lucideMapPin,
      lucideNavigation,
      lucideReceipt,
      lucideTimer,
    }),
  ],
  selector: "app-parking-general-info",
  standalone: true,
  templateUrl: "./parking-general-info.html",
})
export class ParkingGeneralInfo {
  protected readonly LABELS_DETAIL = APP_TEXTS.parking.detail;

  public readonly parking = input.required<ParkingLotListItemModel>();

  public readonly addressLine = computed<string>(() => {
    const address = this.parking()?.address;
    if (!address) {
      return "";
    }
    const { street, city, state } = address;
    return [street, city, state].filter(Boolean).join(", ");
  });

  public readonly addressSubline = computed<string>(() => {
    const address = this.parking()?.address;
    if (!address) {
      return "";
    }
    const { country, zipCode } = address;
    return [country, zipCode].filter(Boolean).join(" · ");
  });

  public readonly formattedCoords = computed<string>(() => {
    const coords = this.parking()?.coordinates;
    if (!coords || coords.latitude == null || coords.longitude == null) {
      return "";
    }
    const latDir = coords.latitude >= 0 ? "N" : "S";
    const lngDir = coords.longitude >= 0 ? "E" : "W";
    const lat = `${Math.abs(coords.latitude).toFixed(4)}° ${latDir}`;
    const lng = `${Math.abs(coords.longitude).toFixed(4)}° ${lngDir}`;
    return `${lat} · ${lng}`;
  });

  public readonly operatingHoursText = computed<string>(() => {
    const hours = this.parking()?.operatingHours;
    if (!hours?.openTime || !hours?.closeTime) {
      return "";
    }
    return `${hours.openTime.split("-")[0]} - ${hours.closeTime.split("-")[0]}`;
  });

  public readonly gracePeriodText = computed<string>(() =>
    formatDuration(this.parking()?.gracePeriodMinutes)
  );

  public readonly gracePeriodPriceText = computed<string>(() =>
    formatPrice(this.parking()?.gracePeriodPrice)
  );

  public readonly ivaRateText = computed<string>(() =>
    formatIvaRate(this.parking()?.ivaRate)
  );
}
