import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
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
  readonly allowEmailResend = input<boolean>(false);
  readonly ticket = input<TicketSummary | null>(null);
  readonly publicUrl = input<string>("");
  readonly initialPhone = input<string>("");
  readonly initialEmail = input<string>("");
  readonly initialChannel = input<DeliveryChannel>("WHATSAPP");

  readonly phoneChange = output<string>();
  readonly emailChange = output<string>();
  readonly channelChange = output<DeliveryChannel>();
  readonly sendEmail = output<string>();

  private readonly destroyRef = inject(DestroyRef);
  private copyTimeoutId?: ReturnType<typeof setTimeout>;

  constructor() {
    this.destroyRef.onDestroy(() => clearTimeout(this.copyTimeoutId));
  }

  readonly activeChannel = linkedSignal<DeliveryChannel>(() =>
    this.initialChannel()
  );
  readonly showEmailChannel = computed<boolean>(
    () => this.mode() === "checkin" || this.allowEmailResend()
  );
  readonly effectiveChannel = computed<DeliveryChannel>(() =>
    this.showEmailChannel() ? this.activeChannel() : "WHATSAPP"
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
      phone =
        rawPhone.length === 10 && rawPhone.startsWith("3")
          ? `57${rawPhone}`
          : rawPhone;
    }

    if (phone) {
      return `https://wa.me/${phone}?text=${msg}`;
    }
    return `https://wa.me/?text=${msg}`;
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

  onSendEmail(): void {
    const email = this.emailInput().trim();
    if (email) {
      this.sendEmail.emit(email);
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
        clearTimeout(this.copyTimeoutId);
        this.copyTimeoutId = setTimeout(() => this.isCopied.set(false), 2000);
      }
    } catch (error) {
      console.warn("Failed to copy ticket URL to clipboard:", error);
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
