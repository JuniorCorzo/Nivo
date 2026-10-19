import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { UserModel } from "@core/models/user.model";
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

  it("should disable changeRole button when user is OWNER", () => {
    fixture.componentRef.setInput("user", mockOwnerUser);
    fixture.detectChanges();

    expect(component.isOwner()).toBe(true);

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: nv-button contains native button element in DOM */
    const changeRoleBtn = compiled.querySelector(
      'nv-button[aria-label="Cambiar Rol"] button'
    ) as HTMLButtonElement | null;
    expect(changeRoleBtn?.disabled).toBe(true);
  });

  it("should not emit changeRole when user is OWNER and onChangeRole is invoked", () => {
    fixture.componentRef.setInput("user", mockOwnerUser);
    fixture.detectChanges();

    let emitted = false;
    component.changeRole.subscribe(() => {
      emitted = true;
    });

    component.onChangeRole();
    expect(emitted).toBe(false);
  });

  it("should enable changeRole button and emit changeRole when user is OPERATOR", () => {
    fixture.componentRef.setInput("user", mockOperatorUser);
    fixture.detectChanges();

    expect(component.isOwner()).toBe(false);

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: nv-button contains native button element in DOM */
    const changeRoleBtn = compiled.querySelector(
      'nv-button[aria-label="Cambiar Rol"] button'
    ) as HTMLButtonElement | null;
    expect(changeRoleBtn?.disabled).toBe(false);

    let emittedUser: UserModel | null = null;
    component.changeRole.subscribe((u) => {
      emittedUser = u;
    });

    component.onChangeRole();
    expect(emittedUser).toEqual(mockOperatorUser);
  });
});
