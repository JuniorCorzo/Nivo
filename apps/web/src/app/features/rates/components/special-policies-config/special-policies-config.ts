import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BadgeComponent,
  CardComponent,
  TypographyH3,
  TypographyMono,
  TypographyMuted,
} from '@nivo-sass/design-system';
import { RateService } from '@core/services/rate-service';

@Component({
  selector: 'app-special-policies-config',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    BadgeComponent,
    TypographyH3,
    TypographyMuted,
    TypographyMono,
  ],
  template: `
    <nv-card class="p-4 sm:p-6 flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <nv-h3>Políticas y zonas especiales</nv-h3>
        <nv-muted>Reglas de recargo o descuento para zonas o condiciones específicas del tenant</nv-muted>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-2">
        @for (policy of policies(); track policy.id) {
          <div class="flex flex-col justify-between rounded-xl border border-border bg-card p-4">
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-foreground">{{ policy.name }}</span>
              <nv-badge [variant]="policy.active ? 'secondary' : 'destructive'">
                {{ policy.active ? 'Activa' : 'Inactiva' }}
              </nv-badge>
            </div>
            <div class="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>Efecto:</span>
              <nv-mono class="text-xs font-semibold text-foreground">
                {{ policy.operation === 'PERCENTAGE' ? policy.valueToModify + '%' : '$' + policy.valueToModify }}
                ({{ policy.modifies }})
              </nv-mono>
            </div>
          </div>
        } @empty {
          <div class="col-span-full rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No hay políticas especiales configuradas para el tenant.
          </div>
        }
      </div>
    </nv-card>
  `,
})
export class SpecialPoliciesConfigComponent implements OnInit {
  private readonly rateService = inject(RateService);
  readonly policies = this.rateService.specialPolicies;

  ngOnInit(): void {
    this.rateService.loadSpecialPolicies().subscribe();
  }
}
