import { CommonModule } from "@angular/common";
import type { OnInit } from "@angular/core";
import { Component, inject } from "@angular/core";
import { RateService } from "@core/services/rate-service";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideShieldCheck, lucidePercent } from "@ng-icons/lucide";

@Component({
  imports: [CommonModule, NgIcon],
  providers: [provideIcons({ lucidePercent, lucideShieldCheck })],
  selector: "app-special-policies-config",
  standalone: true,
  template: `
    <div
      class="bg-card text-card-foreground border-border flex flex-col gap-5 rounded-2xl border p-5 shadow-xs sm:p-6"
    >
      <div class="border-border flex items-center gap-3 border-b pb-3">
        <div
          class="bg-warning/10 text-warning border-warning/20 flex h-9 w-9 items-center justify-center rounded-xl border"
        >
          <ng-icon name="lucideShieldCheck" class="text-base" />
        </div>
        <div>
          <h3 class="text-foreground text-base font-bold">
            Políticas y zonas especiales
          </h3>
          <p class="text-muted-foreground text-xs">
            Reglas de recargo o descuento para zonas o condiciones específicas
            del tenant
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        @for (policy of policies(); track policy.id) {
          <div
            class="border-border bg-card hover:border-border flex flex-col justify-between rounded-2xl border p-5 transition-all"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-foreground text-sm font-bold">{{
                policy.name
              }}</span>
              <span
                class="inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold"
                [class.bg-success/10]="policy.active"
                [class.text-success]="policy.active"
                [class.border-success/20]="policy.active"
                [class.bg-destructive/10]="!policy.active"
                [class.text-destructive]="!policy.active"
                [class.border-destructive/20]="!policy.active"
              >
                {{ policy.active ? "Activa" : "Inactiva" }}
              </span>
            </div>
            <div
              class="border-border mt-4 flex items-center justify-between border-t pt-3 text-xs"
            >
              <span class="text-muted-foreground">Efecto aplicado:</span>
              <span class="text-foreground font-mono font-bold">
                {{
                  policy.operation === "PERCENTAGE"
                    ? policy.valueToModify + "%"
                    : "$" + policy.valueToModify
                }}
                <span class="text-muted-foreground text-xs font-normal"
                  >({{ policy.modifies }})</span
                >
              </span>
            </div>
          </div>
        } @empty {
          <div
            class="border-border text-muted-foreground col-span-full rounded-2xl border border-dashed p-8 text-center text-xs"
          >
            No hay políticas especiales configuradas para el tenant.
          </div>
        }
      </div>
    </div>
  `,
})
export class SpecialPoliciesConfigComponent implements OnInit {
  private readonly rateService = inject(RateService);
  readonly policies = this.rateService.specialPolicies;

  ngOnInit(): void {
    this.rateService.loadSpecialPolicies().subscribe();
  }
}
