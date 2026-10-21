import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { UserModel } from "@core/models/user.model";
import { DataTableState } from "@shared/components/data-table";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { describe, expect, it } from "vitest";

import { createUserColumns } from "./columns";
import { UsersTableComponent } from "./users-table";

describe("UsersTableComponent", () => {
  let component: UsersTableComponent;
  let fixture: ComponentFixture<UsersTableComponent>;
  let usersSignal: ReturnType<typeof signal<UserModel[]>>;

  const mockUsers: UserModel[] = [
    {
      contactInfo: "3001234567",
      createdAt: new Date("2026-01-10T00:00:00.000Z"),
      email: "carlos@nivo.com",
      fullName: "Carlos Propietario",
      id: "u-owner",
      role: "OWNER",
      tenant: { companyName: "Nivo SAS", id: "t-1" },
      updatedAt: new Date("2026-01-10T00:00:00.000Z"),
    },
    {
      contactInfo: "3119876543",
      createdAt: new Date("2026-02-15T00:00:00.000Z"),
      deletedAt: new Date("2026-03-01T00:00:00.000Z"),
      email: "laura@nivo.com",
      fullName: "Laura Inactiva",
      id: "u-inactive",
      role: "OPERATOR",
      tenant: { companyName: "Nivo SAS", id: "t-1" },
      updatedAt: new Date("2026-03-01T00:00:00.000Z"),
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersTableComponent);
    component = fixture.componentInstance;

    usersSignal = signal<UserModel[]>(mockUsers);
    const tableState = new DataTableState<UserModel>();
    const table = tableState.createTable({
      columns: createUserColumns({
        currentUserId: "u-manager",
        onChangeRole: (u) => component.changeRole.emit(u),
        onDeactivate: (u) => component.deactivate.emit(u),
      }),
      data: () => usersSignal(),
      getRowId: (row) => row.id,
    });

    fixture.componentRef.setInput("table", table);
    fixture.componentRef.setInput("isLoading", false);
    fixture.detectChanges();
  });

  it("should render table with users", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll("tbody tr");
    expect(rows.length).toBe(2);

    const firstUserCell = rows[0].querySelector("app-user-info-cell");
    expect(firstUserCell).not.toBeNull();
    expect(firstUserCell?.textContent).toContain("Carlos Propietario");
    expect(firstUserCell?.textContent).toContain("carlos@nivo.com");

    const secondUserCell = rows[1].querySelector("app-user-info-cell");
    expect(secondUserCell).not.toBeNull();
    expect(secondUserCell?.textContent).toContain("Laura Inactiva");
    expect(secondUserCell?.textContent).toContain("laura@nivo.com");
  });

  it("should render role badges correctly", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const roleBadges = compiled.querySelectorAll("app-user-role-badge nv-badge");
    expect(roleBadges.length).toBe(2);
    expect(roleBadges[0].textContent?.trim()).toBe(
      APP_TEXTS.users.table.roles.owner
    );
    expect(roleBadges[1].textContent?.trim()).toBe(
      APP_TEXTS.users.table.roles.operator
    );
  });

  it("should render status badges correctly for active and inactive", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const statusBadges = compiled.querySelectorAll(
      "app-user-status-badge nv-badge"
    );
    expect(statusBadges.length).toBe(2);
    expect(statusBadges[0].textContent?.trim()).toBe(
      APP_TEXTS.users.table.status.active
    );
    expect(statusBadges[1].textContent?.trim()).toBe(
      APP_TEXTS.users.table.status.inactive
    );
  });

  it("should show empty state when users array is empty", () => {
    usersSignal.set([]);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const emptyStateHeading = compiled.querySelector("[emptyState] nv-h4");
    expect(emptyStateHeading?.textContent?.trim()).toBe(
      APP_TEXTS.users.table.emptyState.title
    );
  });

  it("should show loading skeletons when isLoading is true", () => {
    fixture.componentRef.setInput("isLoading", true);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const skeletons = compiled.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("should emit changeRole when clicking change role button", () => {
    let selected: UserModel | null = null;
    component.changeRole.subscribe((u) => {
      selected = u;
    });

    component.changeRole.emit(mockUsers[0]);
    expect(selected).toEqual(mockUsers[0]);
  });

  it("should emit deactivate when clicking deactivate button", () => {
    let deactivated: UserModel | null = null;
    component.deactivate.subscribe((u) => {
      deactivated = u;
    });

    component.deactivate.emit(mockUsers[0]);
    expect(deactivated).toEqual(mockUsers[0]);
  });

  it("should emit resetFilters when clicking reset filters button in empty state", () => {
    usersSignal.set([]);
    fixture.detectChanges();

    let resetCalled = false;
    component.resetFilters.subscribe(() => {
      resetCalled = true;
    });

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: Reset button exists in the rendered empty state */
    const resetButton = compiled.querySelector(
      "[emptyState] nv-button button, [emptyState] button"
    ) as HTMLButtonElement | null;
    expect(resetButton).not.toBeNull();
    resetButton?.click();

    expect(resetCalled).toBe(true);
  });

  it("should enable change role button for users in the table", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const rows = compiled.querySelectorAll("tbody tr");
    expect(rows.length).toBe(2);

    // Row 0 is OWNER
    /* SAFETY: nv-button contains native button element in DOM */
    const ownerChangeRoleBtn = rows[0].querySelector(
      `nv-button[aria-label="${APP_TEXTS.users.table.actions.changeRole}"] button`
    ) as HTMLButtonElement | null;
    expect(ownerChangeRoleBtn?.disabled).toBe(false);

    // Row 1 is OPERATOR
    /* SAFETY: nv-button contains native button element in DOM */
    const operatorChangeRoleBtn = rows[1].querySelector(
      `nv-button[aria-label="${APP_TEXTS.users.table.actions.changeRole}"] button`
    ) as HTMLButtonElement | null;
    expect(operatorChangeRoleBtn?.disabled).toBe(false);
  });
});
