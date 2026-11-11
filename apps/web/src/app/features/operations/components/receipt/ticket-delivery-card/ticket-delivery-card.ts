import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  linkedSignal,
  output,
  signal,
} from "@angular/core";
import type { TicketSummary } from "@core/models/ticket.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCheck,
  lucideCopy,
  lucideMail,
  lucidePhone,
  lucideSend,
  lucideShare2,
} from "@ng-icons/lucide";
import { simpleWhatsapp } from "@ng-icons/simple-icons";
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  CardContentComponent,
  TypographyMuted,
} from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

export type DeliveryChannel = "WHATSAPP" | "EMAIL";
export type DeliveryCardMode = "receipt" | "checkin";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    NgIcon,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    CardContentComponent,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideCheck,
      lucideCopy,
      lucideMail,
      lucidePhone,
      lucideSend,
      lucideShare2,
      simpleWhatsapp,
    }),
  ],
  selector: "app-ticket-delivery-card",
  standalone: true,
  templateUrl: "./ticket-delivery-card.html",
})
export class TicketDeliveryCardComponent {
  readonly texts = APP_TEXTS.ticketReceipt;

  readonly mode = input<DeliveryCardMode>("receipt");
  readonly ticket = input<TicketSummary | null>(null);
  readonly publicUrl = input<string>("");
  readonly initialPhone = input<string>("");
  readonly initialEmail = input<string>("");
  readonly initialChannel = input<DeliveryChannel>("WHATSAPP");

  readonly phoneChange = output<string>();
  readonly emailChange = output<string>();
  readonly channelChange = output<DeliveryChannel>();

  readonly activeChannel = linkedSignal<DeliveryChannel>(() =>
    this.initialChannel()
  );
  readonly phoneInput = linkedSignal<string>(
    () => this.ticket()?.phoneNumber ?? this.initialPhone()
  );
  readonly emailInput = linkedSignal<string>(() => this.initialEmail());

  readonly isCopied = signal<boolean>(false);

  readonly canShare = computed<boolean>(() =>
    Boolean(globalThis.navigator && "share" in globalThis.navigator)
  );

  readonly whatsAppLink = computed<string>(() => {
    const t = this.ticket();
    const url = this.publicUrl();
    const plate = t?.licensePlate || this.texts.unplatedVehicle;
    const msg = encodeURIComponent(this.texts.whatsAppMessage(plate, url));
    const rawPhone = this.phoneInput().replaceAll(/\D/gu, "");
    let phone = "";
    if (rawPhone) {
      phone = rawPhone.startsWith("57") ? rawPhone : `57${rawPhone}`;
    }

    if (phone) {
      return `https://wa.me/${phone}?text=${msg}`;
    }
    return `https://wa.me/?text=${msg}`;
  });

  readonly emailLink = computed<string>(() => {
    const t = this.ticket();
    const url = this.publicUrl();
    const plate = t?.licensePlate || this.texts.unplatedVehicle;
    const subject = encodeURIComponent(`Comprobante de Parqueo - ${plate}`);
    const body = encodeURIComponent(this.texts.whatsAppMessage(plate, url));
    const to = this.emailInput().trim();
    if (to) {
      return `mailto:${to}?subject=${subject}&body=${body}`;
    }
    return `mailto:?subject=${subject}&body=${body}`;
  });

  setChannel(channel: DeliveryChannel): void {
    this.activeChannel.set(channel);
    this.channelChange.emit(channel);
  }

  onPhoneInput(event: Event): void {
    const inputElement = event.target;
    if (inputElement instanceof HTMLInputElement) {
      const val = inputElement.value;
      this.phoneInput.set(val);
      this.phoneChange.emit(val);
    }
  }

  onEmailInput(event: Event): void {
    const inputElement = event.target;
    if (inputElement instanceof HTMLInputElement) {
      const val = inputElement.value;
      this.emailInput.set(val);
      this.emailChange.emit(val);
    }
  }

  async copyPublicUrl(): Promise<void> {
    const url = this.publicUrl();
    if (!url) {
      return;
    }
    try {
      if (globalThis.navigator?.clipboard) {
        await globalThis.navigator.clipboard.writeText(url);
        this.isCopied.set(true);
        setTimeout(() => this.isCopied.set(false), 2000);
      }
    } catch {
      // Ignore clipboard write failures gracefully
    }
  }

  async shareNative(): Promise<void> {
    const t = this.ticket();
    const url = this.publicUrl();
    if (!t || !url || !this.canShare()) {
      return;
    }
    try {
      const plate = t.licensePlate || this.texts.unplatedVehicle;
      await globalThis.navigator.share({
        text: this.texts.whatsAppMessage(plate, url),
        title: `Ticket ${plate}`,
        url,
      });
    } catch {
      // User cancelled share
    }
  }
}
