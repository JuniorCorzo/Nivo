import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { UserService } from "@core/services/user/user-service";
import { ToastService } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { of, throwError } from "rxjs";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { InviteUserModalComponent } from "./invite-user-modal";

interface MockUserService {
  inviteUser: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("InviteUserModalComponent", () => {
  let component: InviteUserModalComponent;
  let fixture: ComponentFixture<InviteUserModalComponent>;
  let userServiceMock: MockUserService;
  let toastServiceMock: MockToastService;

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
      inviteUser: vi.fn().mockReturnValue(of({ message: "OK" })),
    };
    toastServiceMock = {
      showToast: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [InviteUserModalComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InviteUserModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();
  });

  it("should render dialog when isOpen is true", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    /* SAFETY: Dialog element is guaranteed to be an HTMLDialogElement in test environment */
    const dialog = compiled.querySelector("dialog") as HTMLDialogElement;
    expect(dialog).not.toBeNull();
    expect(dialog.open).toBe(true);
    expect(compiled.querySelector('[role="dialog"]')).not.toBeNull();
    expect(compiled.textContent).toContain(APP_TEXTS.users.modals.invite.title);
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

  it("should validate required form fields", () => {
    component.form.controls.fullName.setValue("");
    component.form.controls.email.setValue("invalid-email");
    component.onSubmit();

    expect(component.form.invalid).toBe(true);
    expect(userServiceMock.inviteUser).not.toHaveBeenCalled();
  });

  it("should call userService.inviteUser and emit outputs on valid submission", () => {
    let invitedCalled = false;
    let closedCalled = false;
    component.invited.subscribe(() => {
      invitedCalled = true;
    });
    component.closed.subscribe(() => {
      closedCalled = true;
    });

    component.form.controls.fullName.setValue("Carlos Gómez");
    component.form.controls.email.setValue("carlos@nivo.com");
    component.form.controls.contactInfo.setValue("3001234567");
    component.form.controls.role.setValue("OPERATOR");

    component.onSubmit();

    expect(userServiceMock.inviteUser).toHaveBeenCalledWith(
      "carlos@nivo.com",
      "OPERATOR",
      "Carlos Gómez"
    );
    expect(toastServiceMock.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" })
    );
    expect(invitedCalled).toBe(true);
    expect(closedCalled).toBe(true);
  });

  it("should handle error when userService.inviteUser fails", () => {
    userServiceMock.inviteUser.mockReturnValue(
      throwError(() => new Error("Invite failed"))
    );

    component.form.controls.fullName.setValue("Carlos Gómez");
    component.form.controls.email.setValue("carlos@nivo.com");
    component.form.controls.role.setValue("MANAGER");

    component.onSubmit();

    expect(toastServiceMock.showToast).toHaveBeenCalledWith(
      expect.objectContaining({ type: "error" })
    );
    expect(component.isSubmitting()).toBe(false);
  });

  it("should close modal and reset form on cancel", () => {
    let closedCalled = false;
    component.closed.subscribe(() => {
      closedCalled = true;
    });

    component.form.controls.fullName.setValue("Temp Name");
    component.onCancel();

    expect(closedCalled).toBe(true);
    expect(component.form.controls.fullName.value).toBe("");
  });

  it("should include all selectable roles (OPERATOR, MANAGER, AUDITOR) with localized labels in roleOptions", () => {
    expect(component.roleOptions).toEqual([
      { label: APP_TEXTS.users.table.roles.operator, value: "OPERATOR" },
      { label: APP_TEXTS.users.table.roles.manager, value: "MANAGER" },
      { label: APP_TEXTS.users.table.roles.auditor, value: "AUDITOR" },
    ]);

    for (const option of component.roleOptions) {
      component.onRoleChange(option.value);
      expect(component.form.controls.role.value).toBe(option.value);
    }
  });

  it("should not update role when an invalid role is provided", () => {
    component.form.controls.role.setValue("OPERATOR");
    component.onRoleChange("INVALID_ROLE");
    expect(component.form.controls.role.value).toBe("OPERATOR");
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
