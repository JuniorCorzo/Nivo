import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { UserModel } from "@core/models/user.model";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { describe, expect, it } from "vitest";

import { UserRowActionsComponent } from "./user-row-actions";

describe("UserRowActionsComponent", () => {
  let component: UserRowActionsComponent;
  let fixture: ComponentFixture<UserRowActionsComponent>;

  const mockOwnerUser: UserModel = {
    contactInfo: "3001234567",
    createdAt: new Date("2026-01-10T00:00:00.000Z"),
    email: "owner@nivo.com",
    fullName: "Carlos Propietario",
    id: "u-owner",
    role: "OWNER",
    tenant: { companyName: "Nivo SAS", id: "t-1" },
    updatedAt: new Date("2026-01-10T00:00:00.000Z"),
  };

  const mockOperatorUser: UserModel = {
    contactInfo: "3119876543",
    createdAt: new Date("2026-02-15T00:00:00.000Z"),
    email: "operator@nivo.com",
    fullName: "Pedro Operador",
    id: "u-operator",
    role: "OPERATOR",
    tenant: { companyName: "Nivo SAS", id: "t-1" },
    updatedAt: new Date("2026-02-15T00:00:00.000Z"),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRowActionsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserRowActionsComponent);
    component = fixture.componentInstance;
  });

  it("should enable changeRole button and emit changeRole when row's target user is OWNER", () => {
    fixture.componentRef.setInput("user", mockOwnerUser);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: nv-button contains native button element in DOM */
    const changeRoleBtn = compiled.querySelector(
      `nv-button[aria-label="${APP_TEXTS.users.table.actions.changeRole}"] button`,
    ) as HTMLButtonElement | null;
    expect(changeRoleBtn?.disabled).toBe(false);

    let emittedUser: UserModel | null = null;
    component.changeRole.subscribe((u) => {
      emittedUser = u;
    });

    component.onChangeRole();
    expect(emittedUser).toEqual(mockOwnerUser);
  });

  it("should enable changeRole button and emit changeRole when row's target user is OPERATOR", () => {
    fixture.componentRef.setInput("user", mockOperatorUser);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: nv-button contains native button element in DOM */
    const changeRoleBtn = compiled.querySelector(
      `nv-button[aria-label="${APP_TEXTS.users.table.actions.changeRole}"] button`,
    ) as HTMLButtonElement | null;
    expect(changeRoleBtn?.disabled).toBe(false);

    let emittedUser: UserModel | null = null;
    component.changeRole.subscribe((u) => {
      emittedUser = u;
    });

    component.onChangeRole();
    expect(emittedUser).toEqual(mockOperatorUser);
  });

  it("should disable deactivate button when row's target user is the logged-in user (isSelf)", () => {
    fixture.componentRef.setInput("user", mockOperatorUser);
    fixture.componentRef.setInput("isSelf", true);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: nv-button contains native button element in DOM */
    const deactivateBtn = compiled.querySelector(
      `nv-button[aria-label="${APP_TEXTS.users.table.actions.deactivate}"] button`,
    ) as HTMLButtonElement | null;
    expect(deactivateBtn?.disabled).toBe(true);
  });
});
