import { computed, inject, Injectable, signal } from "@angular/core";
import type { UserModel } from "@core/models/user.model";
import { UserService } from "@core/services/user/user-service";
import { DataTableState } from "@shared/components/data-table";

import { createUserColumns } from "../components/users-table";

@Injectable()
export class UsersPageFacade {
  private readonly userService = inject(UserService);
  private readonly tableState = new DataTableState<UserModel>();

  readonly users = this.userService.users;
  readonly isLoading = signal<boolean>(false);
  readonly searchQuery = signal<string>("");
  readonly roleFilter = signal<string>("ALL");

  readonly selectedUserForRole = signal<UserModel | null>(null);
  readonly selectedUserForDeactivation = signal<UserModel | null>(null);
  readonly isInviteModalOpen = signal<boolean>(false);
  readonly isModifyRoleModalOpen = signal<boolean>(false);
  readonly isDeactivateModalOpen = signal<boolean>(false);

  readonly totalUsers = computed(() => this.users().length);
  readonly activeOperators = computed(
    () =>
      this.users().filter((u) => u.role === "OPERATOR" && !u.deletedAt).length
  );
  readonly managers = computed(
    () =>
      this.users().filter(
        (u) => (u.role === "MANAGER" || u.role === "OWNER") && !u.deletedAt
      ).length
  );
  readonly deactivatedUsers = computed(
    () => this.users().filter((u) => Boolean(u.deletedAt)).length
  );

  readonly columns = computed(() =>
    createUserColumns({
      currentUserId: this.userService.currentUser()?.id,
      onChangeRole: (user) => this.openModifyRoleModal(user),
      onDeactivate: (user) => this.openDeactivateModal(user),
    })
  );

  readonly table = this.tableState.createTable({
    columns: () => this.columns(),
    data: () => this.users(),
    getRowId: (row) => row.id,
    globalFilterFn: (row, _columnId, filterValue: string) => {
      if (!filterValue) {
        return true;
      }
      const search = filterValue.trim().toLowerCase();
      const fullName = (row.original.fullName ?? "").toLowerCase();
      const email = (row.original.email ?? "").toLowerCase();
      return fullName.includes(search) || email.includes(search);
    },
  });

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.listUsers().subscribe({
      error: () => {
        this.isLoading.set(false);
      },
      next: () => {
        this.isLoading.set(false);
      },
    });
  }

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
    this.tableState.setGlobalFilter(query);
  }

  setRoleFilter(role: string): void {
    this.roleFilter.set(role);
    this.tableState.setColumnFilter("role", role === "ALL" ? undefined : role);
  }

  resetFilters(): void {
    this.searchQuery.set("");
    this.roleFilter.set("ALL");
    this.tableState.resetFilters();
  }

  openInviteModal(): void {
    this.isInviteModalOpen.set(true);
  }

  closeInviteModal(): void {
    this.isInviteModalOpen.set(false);
  }

  openModifyRoleModal(user: UserModel): void {
    this.selectedUserForRole.set(user);
    this.isModifyRoleModalOpen.set(true);
  }

  closeModifyRoleModal(): void {
    this.selectedUserForRole.set(null);
    this.isModifyRoleModalOpen.set(false);
  }

  openDeactivateModal(user: UserModel): void {
    this.selectedUserForDeactivation.set(user);
    this.isDeactivateModalOpen.set(true);
  }

  closeDeactivateModal(): void {
    this.selectedUserForDeactivation.set(null);
    this.isDeactivateModalOpen.set(false);
  }
}
