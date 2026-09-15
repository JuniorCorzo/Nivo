import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideArrowLeft, lucideChevronRight } from "@ng-icons/lucide";
import type { PageHeaderBreadcrumbItem } from "../page-header";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, NgIcon],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideChevronRight,
    }),
  ],
  selector: "app-page-header-breadcrumbs",
  standalone: true,
  templateUrl: "./page-header-breadcrumbs.html",
})
export class PageHeaderBreadcrumbsComponent {
  readonly breadcrumbs = input.required<PageHeaderBreadcrumbItem[]>();
  readonly backLink = input<string | unknown[] | null>(null);
  readonly backAriaLabel = input<string>("Volver");
  readonly isRoot = input<boolean>(false);
}
