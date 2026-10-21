import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { UserModel } from "@core/models/user.model";
import { UserService } from "@core/services/user/user-service";
import { ToastService } from "@nivo-sass/design-system";
import { of, throwError } from "rxjs";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { DeactivateUserModalComponent } from "./deactivate-user-modal";

interface MockUserService {
  currentUser: ReturnType<typeof signal<UserModel | null>>;
  deactivateUser: ReturnType<typeof vi.fn>;
  users: ReturnType<typeof signal<UserModel[]>>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("DeactivateUserModalComponent", () => {
  let component: DeactivateUserModalComponent;
  let fixture: ComponentFixture<DeactivateUserModalComponent>;
  let userServiceMock: MockUserService;
  let toastServiceMock: MockToastService;

  const currentManagerUser: UserModel = {
    contactInfo: "3001234567",
    createdAt: new Date(),
    email: "manager@nivo.com",
    fullName: "Manager User",
    id: "user-mgr-1",
    role: "MANAGER",
    tenant: { companyName: "Nivo SAS", id: "t-1" },
    updatedAt: new Date(),
  };

  const targetOperatorUser: UserModel = {
    contactInfo: "3119876543",
    createdAt: new Date(),
    email: "operator@nivo.com",
    fullName: "Operator User",
    id: "user-op-2",
    role: "OPERATOR",
    tenant: { companyName: "Nivo SAS", id: "t-1" },
    updatedAt: new Date(),
  };

  const soleOwnerUser: UserModel = {
    contactInfo: "3123456789",
    createdAt: new Date(),
    email: "owner@nivo.com",
    fullName: "Owner User",
    id: "user-owner-1",
    role: "OWNER",
    tenant: { companyName: "Nivo SAS", id: "t-1" },
    updatedAt: new Date(),
  };

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(
      function mockShowModal(this: HTMLDialogElement) {
        this.open = true;
      }
    );
    HTMLDialogElement.prototype.close = vi.fn(
      function mockClose(this: HTMLDialogElement) {
        this.open = false;
      }
    );
  });

  beforeEach(async () => {
    userServiceMock = {
      currentUser: signal<UserModel | null>(currentManagerUser),
      deactivateUser: vi.fn().mockReturnValue(of(null)),
      users: signal<UserModel[]>([
        currentManagerUser,
        targetOperatorUser,
        soleOwnerUser,
      ]),
    };
    toastServiceMock = {
      showToast: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DeactivateUserModalComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeactivateUserModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("user", targetOperatorUser);
    fixture.detectChanges();
  });

  it("should render dialog with target user info and alertdialog role", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: Dialog element is guaranteed to be an HTMLDialogElement in test environment */
    const dialog = compiled.querySelector("dialog") as HTMLDialogElement;
    expect(dialog).not.toBeNull();
    expect(dialog.open).toBe(true);
    expect(compiled.querySelector('[role="alertdialog"]')).not.toBeNull();
    expect(compiled.textContent).toContain("Operator User");
    expect(compiled.textContent).toContain("operator@nivo.com");
  });

  it("should close dialog when isOpen is false", () => {
    fixture.componentRef.setInput("isOpen", false);
    fixture.detectChanges();

    /* SAFETY: Dialog element is guaranteed to be an HTMLDialogElement in test environment */
    const dialog = fixture.nativeElement.querySelector(
      "dialog"
    ) as HTMLDialogElement;
    expect(dialog.open).toBe(false);
  });

  it("should block and show warning on self-deactivation attempt", () => {
    fixture.componentRef.setInput("user", currentManagerUser);
    fixture.detectChanges();

    expect(component.isSelfDeactivation()).toBe(true);
    expect(component.canDeactivate()).toBe(false);

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      APP_TEXTS.users.modals.deactivate.selfDeactivationWarning
    );

    /* SAFETY: Confirm button is HTMLButtonElement */
    const confirmBtn = compiled.querySelector(
      'button[variant="destructive"], nv-button[variant="destructive"] button, button:last-child'
    ) as HTMLButtonElement;
    expect(confirmBtn?.disabled || component.canDeactivate() === false).toBe(
      true
    );
  });

  it("should block and show warning on sole owner deactivation attempt", () => {
    fixture.componentRef.setInput("user", soleOwnerUser);
    fixture.detectChanges();

    expect(component.isSoleOwner()).toBe(true);
    expect(component.canDeactivate()).toBe(false);

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      APP_TEXTS.users.modals.deactivate.lastOwnerWarning
    );
  });

  it("should call userService.deactivateUser and emit outputs on valid confirmation", () => {
    let deactivatedCalled = false;
    let closedCalled = false;
    component.deactivated.subscribe(() => {
      deactivatedCalled = true;
    });
    component.closed.subscribe(() => {
      closedCalled = true;
    });

    component.onConfirm();

    expect(userServiceMock.deactivateUser).toHaveBeenCalledWith("user-op-2");
    expect(toastServiceMock.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" })
    );
    expect(deactivatedCalled).toBe(true);
    expect(closedCalled).toBe(true);
  });

  it("should handle error when deactivateUser fails", () => {
    userServiceMock.deactivateUser.mockReturnValue(
      throwError(() => new Error("Deactivate failed"))
    );

    component.onConfirm();

    expect(toastServiceMock.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" })
    );
    expect(component.isSubmitting()).toBe(false);
  });

  it("should emit closed on cancel", () => {
    let closedCalled = false;
    component.closed.subscribe(() => {
      closedCalled = true;
    });

    component.onCancel();
    expect(closedCalled).toBe(true);
  });

  it("should emit closed on backdrop click", () => {
    let closedCalled = false;
    component.closed.subscribe(() => {
      closedCalled = true;
    });

    /* SAFETY: Dialog element is guaranteed to be an HTMLDialogElement in test environment */
    const dialog = fixture.nativeElement.querySelector(
      "dialog"
    ) as HTMLDialogElement;
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(closedCalled).toBe(true);
  });

  it("should close dialog on ngOnDestroy if open", () => {
    /* SAFETY: Dialog element is guaranteed to be an HTMLDialogElement in test environment */
    const dialog = fixture.nativeElement.querySelector(
      "dialog"
    ) as HTMLDialogElement;
    expect(dialog.open).toBe(true);

    fixture.destroy();
    expect(dialog.open).toBe(false);
  });
});
