import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
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
import { formatCoordinates } from "@shared/utils/coordinates.utils";
import { formatDuration } from "@shared/utils/duration.utils";
import { formatIvaRate } from "@shared/utils/percentage.utils";
import { formatPrice } from "@shared/utils/price.utils";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BadgeComponent,
    CardComponent,
    TypographyH2,
    TypographyH3,
    TypographyMono,
    TypographyMuted,
    TypographySpan,
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
    const coordinates = this.parking()?.coordinates;
    if (!coordinates) {
      return "";
    }
    return formatCoordinates(coordinates);
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
