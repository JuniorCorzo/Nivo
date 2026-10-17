import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { UserModel } from "@core/models/user.model";
import { UserService } from "@core/services/user/user-service";
import { ToastService } from "@nivo-sass/design-system";
import { of, throwError } from "rxjs";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

  it("should render modal with user info and title", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="dialog"]')).not.toBeNull();
    expect(compiled.textContent).toContain("Modificar Rol de Usuario");
    expect(compiled.textContent).toContain("Pedro Operador");
    expect(compiled.textContent).toContain("operator@nivo.com");
  });

  it("should not render modal when isOpen is false", () => {
    fixture.componentRef.setInput("isOpen", false);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
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
});
