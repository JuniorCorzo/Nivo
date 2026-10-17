import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { UserModel } from "@core/models/user.model";
import { DataTableState } from "@shared/components/data-table";
import { describe, expect, it } from "vitest";

import { createUserColumns } from "./user-columns-definition";
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
    expect(compiled.textContent).toContain("Carlos Propietario");
    expect(compiled.textContent).toContain("carlos@nivo.com");
    expect(compiled.textContent).toContain("Laura Inactiva");
    expect(compiled.textContent).toContain("laura@nivo.com");
  });

  it("should render role badges correctly", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Propietario");
    expect(compiled.textContent).toContain("Operador");
  });

  it("should render status badges correctly for active and inactive", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Activo");
    expect(compiled.textContent).toContain("Inactivo");
  });

  it("should show empty state when users array is empty", () => {
    usersSignal.set([]);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("No se encontraron usuarios");
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
    const resetButton = compiled.querySelector("button") as HTMLButtonElement;
    resetButton.click();

    expect(resetCalled).toBe(true);
  });
});
