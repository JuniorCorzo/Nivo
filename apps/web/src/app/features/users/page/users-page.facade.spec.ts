import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { UserModel } from "@core/models/user.model";
import { UserService } from "@core/services/user/user-service";
import { of, throwError } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { UsersPageFacade } from "./users-page.facade";

interface MockUserService {
  currentUser: ReturnType<typeof signal<UserModel | null>>;
  listUsers: ReturnType<typeof vi.fn>;
  users: ReturnType<typeof signal<UserModel[]>>;
}

describe("UsersPageFacade", () => {
  let facade: UsersPageFacade;
  let userServiceMock: MockUserService;

  const mockUsers: UserModel[] = [
    {
      contactInfo: "3001111111",
      createdAt: new Date(),
      email: "owner@nivo.com",
      fullName: "Owner User",
      id: "u-1",
      role: "OWNER",
      tenant: { companyName: "Nivo", id: "t-1" },
      updatedAt: new Date(),
    },
    {
      contactInfo: "3002222222",
      createdAt: new Date(),
      email: "manager@nivo.com",
      fullName: "Manager User",
      id: "u-2",
      role: "MANAGER",
      tenant: { companyName: "Nivo", id: "t-1" },
      updatedAt: new Date(),
    },
    {
      contactInfo: "3003333333",
      createdAt: new Date(),
      email: "op1@nivo.com",
      fullName: "Operator One",
      id: "u-3",
      role: "OPERATOR",
      tenant: { companyName: "Nivo", id: "t-1" },
      updatedAt: new Date(),
    },
    {
      contactInfo: "3004444444",
      createdAt: new Date(),
      deletedAt: new Date(),
      email: "op2@nivo.com",
      fullName: "Operator Two Inactive",
      id: "u-4",
      role: "OPERATOR",
      tenant: { companyName: "Nivo", id: "t-1" },
      updatedAt: new Date(),
    },
  ];

  beforeEach(() => {
    userServiceMock = {
      currentUser: signal<UserModel | null>(mockUsers[0]),
      listUsers: vi.fn().mockReturnValue(of(mockUsers)),
      users: signal<UserModel[]>(mockUsers),
    };

    TestBed.configureTestingModule({
      providers: [UsersPageFacade, { provide: UserService, useValue: userServiceMock }],
    });

    facade = TestBed.inject(UsersPageFacade);
  });

  it("should calculate correct KPIs from users signal", () => {
    expect(facade.totalUsers()).toBe(4);
    expect(facade.activeOperators()).toBe(1);
    // Combined OWNER + MANAGER
    expect(facade.managers()).toBe(2);
    expect(facade.deactivatedUsers()).toBe(1);
  });

  it("should load users and toggle isLoading state", () => {
    facade.loadUsers();
    expect(userServiceMock.listUsers).toHaveBeenCalledTimes(1);
    expect(facade.isLoading()).toBe(false);
  });

  it("should handle error in loadUsers", () => {
    userServiceMock.listUsers.mockReturnValue(throwError(() => new Error("Network error")));
    facade.loadUsers();
    expect(facade.isLoading()).toBe(false);
  });

  it("should update search query filter", () => {
    facade.setSearchQuery("Operator");
    expect(facade.searchQuery()).toBe("Operator");
  });

  it("should update role filter", () => {
    facade.setRoleFilter("OPERATOR");
    expect(facade.roleFilter()).toBe("OPERATOR");
  });

  it("should reset filters to defaults", () => {
    facade.setSearchQuery("Operator");
    facade.setRoleFilter("OPERATOR");
    facade.resetFilters();

    expect(facade.searchQuery()).toBe("");
    expect(facade.roleFilter()).toBe("ALL");
  });

  it("should open and close invite modal", () => {
    facade.openInviteModal();
    expect(facade.isInviteModalOpen()).toBe(true);

    facade.closeInviteModal();
    expect(facade.isInviteModalOpen()).toBe(false);
  });

  it("should open and close modify role modal", () => {
    facade.openModifyRoleModal(mockUsers[2]);
    expect(facade.selectedUserForRole()).toEqual(mockUsers[2]);
    expect(facade.isModifyRoleModalOpen()).toBe(true);

    facade.closeModifyRoleModal();
    expect(facade.selectedUserForRole()).toBeNull();
    expect(facade.isModifyRoleModalOpen()).toBe(false);
  });

  it("should open and close deactivate modal", () => {
    facade.openDeactivateModal(mockUsers[2]);
    expect(facade.selectedUserForDeactivation()).toEqual(mockUsers[2]);
    expect(facade.isDeactivateModalOpen()).toBe(true);

    facade.closeDeactivateModal();
    expect(facade.selectedUserForDeactivation()).toBeNull();
    expect(facade.isDeactivateModalOpen()).toBe(false);
  });
});
