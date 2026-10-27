import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck } from "@ng-icons/lucide";
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  TypographyH3,
  TypographyMuted,
} from "@nivo-sass/design-system";

export interface PricingPlanItem {
  readonly name: string;
  readonly description: string;
  readonly price: string;
  readonly period: string;
  readonly features: readonly string[];
  readonly cta: string;
  readonly isPopular?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgIcon,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    TypographyH3,
    TypographyMuted,
  ],
  providers: [
    provideIcons({
      lucideCheck,
    }),
  ],
  selector: "app-pricing-card",
  standalone: true,
  template: `
    <nv-card
      class="bg-card relative flex flex-col justify-between p-8 transition-all duration-300 hover:-translate-y-1"
      [class.border-border]="!plan().isPopular"
      [class.shadow-xs]="!plan().isPopular"
      [class.border-2]="plan().isPopular"
      [class.border-[var(--semantic-success)]/50]="plan().isPopular"
      [class.shadow-xl]="plan().isPopular"
      [class.shadow-[var(--semantic-success)]/10]="plan().isPopular"
      [class.hover:border-[var(--semantic-success)]]="plan().isPopular"
      [class.hover:shadow-[var(--semantic-success)]/20]="plan().isPopular"
    >
      @if (plan().isPopular && popularBadge()) {
        <div class="absolute -top-3 left-1/2 -translate-x-1/2">
          <nv-badge variant="success" class="px-3 text-xs font-semibold">
            {{ popularBadge() }}
          </nv-badge>
        </div>
      }

      <div>
        <nv-h3 class="text-xl font-bold">{{ plan().name }}</nv-h3>
        <nv-muted class="mt-1 text-xs">
          {{ plan().description }}
        </nv-muted>

        <div class="my-6">
          <span
            class="font-mono text-4xl font-bold"
            [class.text-[var(--semantic-success)]]="plan().isPopular"
          >
            {{ plan().price }}
          </span>
          <span class="text-sm text-[var(--muted-foreground)]">
            {{ plan().period }}
          </span>
        </div>

        <ul class="space-y-3 text-sm text-[var(--muted-foreground)]">
          @for (feature of plan().features; track feature) {
            <li class="flex items-center gap-2">
              <ng-icon
                name="lucideCheck"
                size="16"
                class="text-[var(--semantic-success)]"
              />
              <span>{{ feature }}</span>
            </li>
          }
        </ul>
      </div>

      <div class="mt-8">
        <nv-button
          class="w-full transition-transform duration-150 active:scale-95"
          [variant]="plan().isPopular ? 'default' : 'outline'"
          (click)="ctaClick.emit()"
        >
          {{ plan().cta }}
        </nv-button>
      </div>
    </nv-card>
  `,
})
export class PricingCardComponent {
  readonly plan = input.required<PricingPlanItem>();
  readonly popularBadge = input<string | null>(null);
  readonly ctaClick = output();
}

export { PricingCardComponent as LandingPricingCardComponent };
