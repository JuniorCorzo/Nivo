import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { UserModel } from "@core/models/user.model";
import { UserService } from "@core/services/user/user-service";
import { ToastService } from "@nivo-sass/design-system";
import { of } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UsersPageComponent } from "./users-page";

interface MockUserService {
  currentUser: ReturnType<typeof signal<UserModel | null>>;
  deactivateUser: ReturnType<typeof vi.fn>;
  inviteUser: ReturnType<typeof vi.fn>;
  listUsers: ReturnType<typeof vi.fn>;
  modifyRole: ReturnType<typeof vi.fn>;
  users: ReturnType<typeof signal<UserModel[]>>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("UsersPageComponent", () => {
  let component: UsersPageComponent;
  let fixture: ComponentFixture<UsersPageComponent>;
  let userServiceMock: MockUserService;
  let toastServiceMock: MockToastService;

  const mockUsers: UserModel[] = [
    {
      contactInfo: "3001111111",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      email: "owner@nivo.com",
      fullName: "Owner User",
      id: "u-1",
      role: "OWNER",
      tenant: { companyName: "Nivo SAS", id: "t-1" },
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    },
    {
      contactInfo: "3002222222",
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
      email: "manager@nivo.com",
      fullName: "Manager User",
      id: "u-2",
      role: "MANAGER",
      tenant: { companyName: "Nivo SAS", id: "t-1" },
      updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    },
    {
      contactInfo: "3003333333",
      createdAt: new Date("2026-01-03T00:00:00.000Z"),
      email: "op@nivo.com",
      fullName: "Operator User",
      id: "u-3",
      role: "OPERATOR",
      tenant: { companyName: "Nivo SAS", id: "t-1" },
      updatedAt: new Date("2026-01-03T00:00:00.000Z"),
    },
    {
      contactInfo: "3004444444",
      createdAt: new Date("2026-01-04T00:00:00.000Z"),
      deletedAt: new Date("2026-02-01T00:00:00.000Z"),
      email: "inactive@nivo.com",
      fullName: "Inactive Operator",
      id: "u-4",
      role: "OPERATOR",
      tenant: { companyName: "Nivo SAS", id: "t-1" },
      updatedAt: new Date("2026-01-04T00:00:00.000Z"),
    },
  ];

  beforeEach(async () => {
    userServiceMock = {
      currentUser: signal<UserModel | null>(mockUsers[0]),
      deactivateUser: vi.fn().mockReturnValue(of(null)),
      inviteUser: vi.fn().mockReturnValue(of({ message: "OK" })),
      listUsers: vi.fn().mockReturnValue(of(mockUsers)),
      modifyRole: vi.fn().mockReturnValue(of(mockUsers[2])),
      users: signal<UserModel[]>(mockUsers),
    };
    toastServiceMock = {
      showToast: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [UsersPageComponent],
      providers: [
        provideRouter([]),
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UsersPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component and load users on init", () => {
    expect(component).toBeTruthy();
    expect(userServiceMock.listUsers).toHaveBeenCalledTimes(1);
  });

  it("should render page header title and subtitle", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Gestión de Usuarios");
    expect(compiled.textContent).toContain(
      "Administra el equipo de tu parqueadero"
    );
  });

  it("should render 4 KPI metric cards with calculated values", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain("Total Usuarios");
    expect(compiled.textContent).toContain("Operadores Activos");
    expect(compiled.textContent).toContain("Administradores");
    expect(compiled.textContent).toContain("Usuarios Inactivos");

    const { facade } = component;
    expect(facade.totalUsers()).toBe(4);
    expect(facade.activeOperators()).toBe(1);
    expect(facade.managers()).toBe(2);
    expect(facade.deactivatedUsers()).toBe(1);
  });

  it("should handle search input change", () => {
    const setSearchSpy = vi.spyOn(component.facade, "setSearchQuery");
    const inputElement = document.createElement("input");
    inputElement.value = "Manager";
    const inputEvent = new Event("input");
    Object.defineProperty(inputEvent, "target", { value: inputElement });

    component.onSearchInput(inputEvent);
    expect(setSearchSpy).toHaveBeenCalledWith("Manager");
    expect(component.facade.searchQuery()).toBe("Manager");
  });

  it("should filter by role on filter button click", () => {
    const setRoleSpy = vi.spyOn(component.facade, "setRoleFilter");
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = [...compiled.querySelectorAll("button")];
    const operatorButton = buttons.find((b) =>
      b.textContent?.includes("Operador")
    );
    expect(operatorButton).toBeDefined();

    operatorButton?.click();
    expect(setRoleSpy).toHaveBeenCalledWith("OPERATOR");
  });

  it("should open invite user modal when clicking invite button", () => {
    expect(component.facade.isInviteModalOpen()).toBe(false);

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = [...compiled.querySelectorAll("button")];
    const inviteButton = buttons.find((b) =>
      b.textContent?.includes("Invitar Usuario")
    );
    expect(inviteButton).toBeDefined();

    inviteButton?.click();
    expect(component.facade.isInviteModalOpen()).toBe(true);
  });

  it("should render child section components app-users-kpi-grid and app-users-filters", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector("app-users-kpi-grid")).not.toBeNull();
    expect(compiled.querySelector("app-users-filters")).not.toBeNull();
  });

  it("should emit search query when typing in filters search input", () => {
    const setSearchSpy = vi.spyOn(component.facade, "setSearchQuery");
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: app-users-filters contains an input element for search query */
    const searchInput = compiled.querySelector(
      "app-users-filters input"
    ) as HTMLInputElement | null;
    expect(searchInput).not.toBeNull();

    if (searchInput) {
      searchInput.value = "Auditor";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
      expect(setSearchSpy).toHaveBeenCalledWith("Auditor");
      expect(component.facade.searchQuery()).toBe("Auditor");
    }
  });

  it("should contain zero emojis in rendered template", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    const emojiRegex =
      /(?<emoji>\p{Extended_Pictographic}|\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]|\uD83E[\uDD00-\uDDFF])/u;
    expect(emojiRegex.test(compiled.textContent ?? "")).toBe(false);
  });
});
