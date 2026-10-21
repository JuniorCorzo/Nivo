import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { UserModel } from "@core/models/user.model";
import { UserService } from "@core/services/user/user-service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { of, throwError } from "rxjs";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ModifyRoleModalComponent } from "./modify-role-modal";

interface MockUserService {
  modifyRole: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("ModifyRoleModalComponent", () => {
  let component: ModifyRoleModalComponent;
  let fixture: ComponentFixture<ModifyRoleModalComponent>;
  let userServiceMock: MockUserService;
  let toastServiceMock: MockToastService;

  const mockUser: UserModel = {
    contactInfo: "3001234567",
    createdAt: new Date(),
    email: "operator@nivo.com",
    fullName: "Pedro Operador",
    id: "user-op-1",
    role: "OPERATOR",
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
      modifyRole: vi.fn().mockReturnValue(of(mockUser)),
    };
    toastServiceMock = {
      showToast: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ModifyRoleModalComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ModifyRoleModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("user", mockUser);
    fixture.detectChanges();
  });

  it("should render dialog with user info and title", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: Dialog element is guaranteed to be an HTMLDialogElement in test environment */
    const dialog = compiled.querySelector("dialog") as HTMLDialogElement;
    expect(dialog).not.toBeNull();
    expect(dialog.open).toBe(true);
    expect(compiled.querySelector('[role="dialog"]')).not.toBeNull();
    expect(compiled.textContent).toContain(
      APP_TEXTS.users.modals.modifyRole.title
    );
    expect(compiled.textContent).toContain("Pedro Operador");
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

  it("should initialize selectedRole with user's role", () => {
    expect(component.selectedRole()).toBe("OPERATOR");
  });

  it("should call userService.modifyRole and emit outputs on submit", () => {
    let updatedCalled = false;
    let closedCalled = false;
    component.updated.subscribe(() => {
      updatedCalled = true;
    });
    component.closed.subscribe(() => {
      closedCalled = true;
    });

    component.onRoleChange("MANAGER");
    component.onSubmit();

    expect(userServiceMock.modifyRole).toHaveBeenCalledWith(
      "user-op-1",
      "MANAGER"
    );
    expect(toastServiceMock.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" })
    );
    expect(updatedCalled).toBe(true);
    expect(closedCalled).toBe(true);
  });

  it("should handle error when modifyRole fails", () => {
    userServiceMock.modifyRole.mockReturnValue(
      throwError(() => new Error("Update role failed"))
    );

    component.onSubmit();

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

  it("should render role badge for the user", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(
      APP_TEXTS.users.modals.modifyRole.currentRoleLabel
    );
    expect(compiled.textContent).toContain(
      APP_TEXTS.users.table.roles.operator
    );
  });

  it("should initialize selectedRole to AUDITOR when user has AUDITOR role", () => {
    const auditorUser: UserModel = {
      ...mockUser,
      id: "user-aud-1",
      role: "AUDITOR",
    };
    fixture.componentRef.setInput("user", auditorUser);
    fixture.detectChanges();

    expect(component.selectedRole()).toBe("AUDITOR");
  });

  it("should validate all selectable roles against roleOptions and allow selecting each", () => {
    expect(component.roleOptions).toEqual([
      { label: APP_TEXTS.users.table.roles.operator, value: "OPERATOR" },
      { label: APP_TEXTS.users.table.roles.manager, value: "MANAGER" },
      { label: APP_TEXTS.users.table.roles.auditor, value: "AUDITOR" },
    ]);

    for (const option of component.roleOptions) {
      component.onRoleChange(option.value);
      expect(component.selectedRole()).toBe(option.value);

      component.onSubmit();
      expect(userServiceMock.modifyRole).toHaveBeenCalledWith(
        "user-op-1",
        option.value
      );
    }
  });

  it("should not update selectedRole when an invalid role is provided", () => {
    component.selectedRole.set("OPERATOR");
    component.onRoleChange("INVALID_ROLE");
    expect(component.selectedRole()).toBe("OPERATOR");
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

  describe("OWNER protection", () => {
    const ownerUser: UserModel = {
      ...mockUser,
      id: "user-owner-1",
      role: "OWNER",
    };

    beforeEach(() => {
      fixture.componentRef.setInput("user", ownerUser);
      fixture.detectChanges();
    });

    it("should recognize user as OWNER", () => {
      expect(component.isOwner()).toBe(true);
    });

    it("should display notice that owner role cannot be modified", () => {
      /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled.textContent).toContain(
        APP_TEXTS.users.modals.modifyRole.ownerRoleNotice
      );
    });

    it("should disable submit button and prevent submission for OWNER", () => {
      /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
      const compiled = fixture.nativeElement as HTMLElement;
      /* SAFETY: nv-button contains native button element in DOM */
      const submitBtn = compiled.querySelector(
        "nv-button:last-of-type button"
      ) as HTMLButtonElement | null;
      expect(submitBtn?.disabled).toBe(true);

      // Verify onSubmit does not invoke modifyRole
      component.onSubmit();
      expect(userServiceMock.modifyRole).not.toHaveBeenCalled();
    });
  });
});
