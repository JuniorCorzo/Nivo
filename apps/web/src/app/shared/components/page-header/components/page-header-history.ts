import { ChangeDetectionStrategy, Component, output } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideChevronLeft, lucideChevronRight } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, NgIcon],
  providers: [
    provideIcons({
      lucideChevronLeft,
      lucideChevronRight,
    }),
  ],
  selector: "app-page-header-history",
  standalone: true,
  template: `
    <div
      class="border-border bg-muted inline-flex h-6 shrink-0 items-center rounded-md border px-0.5"
      data-testid="page-header-history"
    >
      <nv-button
        variant="ghost"
        size="icon"
        (click)="back.emit()"
        class="!h-5 !w-5 !p-0 text-muted-foreground hover:text-foreground"
        aria-label="Atrás"
        title="Atrás"
        data-testid="page-header-back-btn"
      >
        <ng-icon name="lucideChevronLeft" size="12" class="shrink-0" />
      </nv-button>
      <nv-button
        variant="ghost"
        size="icon"
        (click)="forward.emit()"
        class="!h-5 !w-5 !p-0 text-muted-foreground hover:text-foreground"
        aria-label="Adelante"
        title="Adelante"
        data-testid="page-header-forward-btn"
      >
        <ng-icon name="lucideChevronRight" size="12" class="shrink-0" />
      </nv-button>
    </div>
  `,
})
export class PageHeaderHistoryComponent {
  readonly back = output();
  readonly forward = output();
}
