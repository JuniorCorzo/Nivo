import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RateService } from '@core/services/rate-service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideShieldCheck, lucidePercent } from '@ng-icons/lucide';

@Component({
  selector: 'app-special-policies-config',
  standalone: true,
  imports: [
    CommonModule,
    NgIcon,
  ],
  providers: [provideIcons({ lucideShieldCheck, lucidePercent })],
  template: `
    <div class="rounded-2xl bg-card text-card-foreground border border-border p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      <div class="flex items-center gap-3 border-b border-border pb-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-warning/10 text-warning border border-warning/20">
          <ng-icon name="lucideShieldCheck" class="text-base" />
        </div>
        <div>
          <h3 class="text-base font-bold text-foreground">Políticas y zonas especiales</h3>
          <p class="text-xs text-muted-foreground">Reglas de recargo o descuento para zonas o condiciones específicas del tenant</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        @for (policy of policies(); track policy.id) {
          <div class="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 transition-all hover:border-border">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-foreground">{{ policy.name }}</span>
              <span
                class="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold border"
                [class.bg-success/10]="policy.active"
                [class.text-success]="policy.active"
                [class.border-success/20]="policy.active"
                [class.bg-destructive/10]="!policy.active"
                [class.text-destructive]="!policy.active"
                [class.border-destructive/20]="!policy.active"
              >
                {{ policy.active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
            <div class="mt-4 flex items-center justify-between text-xs border-t border-border pt-3">
              <span class="text-muted-foreground">Efecto aplicado:</span>
              <span class="font-mono font-bold text-foreground">
                {{ policy.operation === 'PERCENTAGE' ? policy.valueToModify + '%' : '$' + policy.valueToModify }}
                <span class="text-xs font-normal text-muted-foreground">({{ policy.modifies }})</span>
              </span>
            </div>
          </div>
        } @empty {
          <div class="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
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

