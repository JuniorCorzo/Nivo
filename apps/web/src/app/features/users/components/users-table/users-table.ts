import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import type { UserModel } from "@core/models/user.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideRotateCcw, lucideUsers } from "@ng-icons/lucide";
import {
  ButtonComponent,
  TypographyH4,
  TypographyMuted,
} from "@nivo-sass/design-system";
import {
  DataTableComponent,
  DataTablePaginationComponent,
  EmptyStateDirective,
} from "@shared/components/data-table";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import type { Table } from "@tanstack/angular-table";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DataTableComponent,
    DataTablePaginationComponent,
    EmptyStateDirective,
    ButtonComponent,
    TypographyH4,
    TypographyMuted,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideRotateCcw,
      lucideUsers,
    }),
  ],
  selector: "app-users-table",
  standalone: true,
  templateUrl: "./users-table.html",
})
export class UsersTableComponent {
  readonly texts = APP_TEXTS.users.table;

  readonly table = input.required<Table<UserModel>>();
  readonly isLoading = input<boolean>(false);

  readonly changeRole = output<UserModel>();
  readonly deactivate = output<UserModel>();
  readonly resetFilters = output();
}
