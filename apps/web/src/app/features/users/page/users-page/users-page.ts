import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import type { OnInit } from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideUserPlus, lucideUsers } from "@ng-icons/lucide";
import { ButtonComponent } from "@nivo-sass/design-system";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { DeactivateUserModalComponent } from "../../components/deactivate-user-modal/deactivate-user-modal";
import { InviteUserModalComponent } from "../../components/invite-user-modal/invite-user-modal";
import { ModifyRoleModalComponent } from "../../components/modify-role-modal/modify-role-modal";
import { UsersTableComponent } from "../../components/users-table";
import { UsersPageFacade } from "../users-page.facade";
import { UsersFiltersComponent } from "./components/users-filters/users-filters";
import { UsersKpiGridComponent } from "./components/users-kpi-grid/users-kpi-grid";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block w-full",
  },
  imports: [
    ButtonComponent,
    DeactivateUserModalComponent,
    InviteUserModalComponent,
    ModifyRoleModalComponent,
    NgIcon,
    PageHeaderComponent,
    UsersFiltersComponent,
    UsersKpiGridComponent,
    UsersTableComponent,
  ],
  providers: [
    UsersPageFacade,
    provideIcons({
      lucideUserPlus,
      lucideUsers,
    }),
  ],
  selector: "app-users-page",
  standalone: true,
  templateUrl: "./users-page.html",
})
export class UsersPageComponent implements OnInit {
  readonly facade = inject(UsersPageFacade);
  readonly texts = APP_TEXTS.users;

  readonly roleFilters = [
    { label: APP_TEXTS.users.actions.allRolesFilter, value: "ALL" },
    { label: APP_TEXTS.users.table.roles.owner, value: "OWNER" },
    { label: APP_TEXTS.users.table.roles.manager, value: "MANAGER" },
    { label: APP_TEXTS.users.table.roles.operator, value: "OPERATOR" },
    { label: APP_TEXTS.users.table.roles.auditor, value: "AUDITOR" },
  ] as const;

  ngOnInit(): void {
    this.facade.loadUsers();
  }

  onSearchInput(event: Event): void {
    /* SAFETY: event target of text input is guaranteed HTMLInputElement */
    const target = event.target as HTMLInputElement;
    this.facade.setSearchQuery(target.value);
  }
}
