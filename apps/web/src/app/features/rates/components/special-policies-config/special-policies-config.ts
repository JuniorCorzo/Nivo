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
    <div class="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      <div class="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 pb-3">
        <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <ng-icon name="lucideShieldCheck" class="text-base" />
        </div>
        <div>
          <h3 class="text-base font-bold text-neutral-900 dark:text-neutral-50">Políticas y zonas especiales</h3>
          <p class="text-xs text-neutral-500 dark:text-neutral-400">Reglas de recargo o descuento para zonas o condiciones específicas del tenant</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        @for (policy of policies(); track policy.id) {
          <div class="flex flex-col justify-between rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850/60 p-5 transition-all hover:border-neutral-300 dark:hover:border-neutral-700">
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-neutral-900 dark:text-neutral-100">{{ policy.name }}</span>
              <span
                class="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
                [class.bg-emerald-50]="policy.active"
                [class.text-emerald-700]="policy.active"
                [class.dark:bg-emerald-950/40]="policy.active"
                [class.dark:text-emerald-300]="policy.active"
                [class.bg-red-50]="!policy.active"
                [class.text-red-700]="!policy.active"
                [class.dark:bg-red-950/40]="!policy.active"
                [class.dark:text-red-300]="!policy.active"
              >
                {{ policy.active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
            <div class="mt-4 flex items-center justify-between text-xs border-t border-neutral-100 dark:border-neutral-800 pt-3">
              <span class="text-neutral-500 dark:text-neutral-400">Efecto aplicado:</span>
              <span class="font-mono font-bold text-neutral-900 dark:text-neutral-50">
                {{ policy.operation === 'PERCENTAGE' ? policy.valueToModify + '%' : '$' + policy.valueToModify }}
                <span class="text-xs font-normal text-neutral-500">({{ policy.modifies }})</span>
              </span>
            </div>
          </div>
        } @empty {
          <div class="col-span-full rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 text-center text-xs text-neutral-400">
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

