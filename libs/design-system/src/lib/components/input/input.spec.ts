import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

import { InputComponent } from "./input";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [InputComponent, ReactiveFormsModule],
  standalone: true,
  template: `
    <nv-input
      id="test-text-input"
      label="Username"
      placeholder="Enter your username"
      [required]="true"
      [formControl]="textControl"
      [hint]="hintText()"
      [error]="errors()"
    />

    <nv-input
      id="test-password-input"
      label="Password"
      type="password"
      placeholder="Enter password"
      [formControl]="passwordControl"
    />

    <nv-input
      id="test-disabled-input"
      label="Disabled Field"
      [disabled]="true"
      value="Preset Value"
    />
  `,
})
class TestHostComponent {
  readonly textControl = new FormControl("initial");
  readonly passwordControl = new FormControl("secret123");
  readonly hintText = signal("Must be unique");
  readonly errors = signal<Array<{ message: string }> | undefined>(undefined);
}

describe("InputComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    /* SAFETY: The test fixture native element is a DOM HTMLElement */
    element = fixture.nativeElement as HTMLElement;
  });

  describe("Label and Basic Rendering", () => {
    it("should render label with for attribute matching input id and show asterisk for required field", () => {
      const label = element.querySelector<HTMLLabelElement>("#test-text-input label");
      const input = element.querySelector<HTMLInputElement>("#test-text-input input");

      expect(label).not.toBeNull();
      expect(input).not.toBeNull();
      expect(label?.getAttribute("for")).toBe(input?.id);
      expect(label?.textContent).toContain("Username");

      const asterisk = label?.querySelector("span");
      expect(asterisk).not.toBeNull();
      expect(asterisk?.textContent?.trim()).toBe("*");
      expect(asterisk?.getAttribute("aria-hidden")).toBe("true");
    });

    it("should render placeholder and placeholder styling classes", () => {
      const input = element.querySelector<HTMLInputElement>("#test-text-input input");
      expect(input?.placeholder).toBe("Enter your username");
      expect(input?.className).toContain("placeholder:text-[var(--muted-foreground)]");
      expect(input?.className).toContain("border-[var(--input)]");
    });

    it("should display hint text when no errors are present", () => {
      const hint = element.querySelector<HTMLParagraphElement>("#test-text-input p");
      expect(hint).not.toBeNull();
      expect(hint?.textContent?.trim()).toBe("Must be unique");
    });
  });

  describe("Value Binding and CVA", () => {
    it("should bind initial value from FormControl and update when control changes", () => {
      const input = element.querySelector<HTMLInputElement>("#test-text-input input");
      expect(input?.value).toBe("initial");

      hostComponent.textControl.setValue("updated-username");
      fixture.detectChanges();
      expect(input?.value).toBe("updated-username");
    });

    it("should update form control value when input event fires", () => {
      const input = element.querySelector<HTMLInputElement>("#test-text-input input");
      expect(input).not.toBeNull();

      if (input) {
        input.value = "new-typed-value";
        input.dispatchEvent(new Event("input"));
      }
      fixture.detectChanges();

      expect(hostComponent.textControl.value).toBe("new-typed-value");
    });

    it("should render preset value from input binding", () => {
      const input = element.querySelector<HTMLInputElement>("#test-disabled-input input");
      expect(input?.value).toBe("Preset Value");
    });
  });

  describe("Password Visibility Toggle", () => {
    it("should start with type password and render toggle button", () => {
      const input = element.querySelector<HTMLInputElement>("#test-password-input input");
      const toggleBtn = element.querySelector<HTMLButtonElement>("#test-password-input button");

      expect(input?.type).toBe("password");
      expect(toggleBtn).not.toBeNull();
      expect(toggleBtn?.getAttribute("aria-label")).toBe("Show password");
    });

    it("should toggle type to text when toggle button is clicked, then back to password", () => {
      const input = element.querySelector<HTMLInputElement>("#test-password-input input");
      const toggleBtn = element.querySelector<HTMLButtonElement>("#test-password-input button");

      toggleBtn?.click();
      fixture.detectChanges();

      expect(input?.type).toBe("text");
      expect(toggleBtn?.getAttribute("aria-label")).toBe("Hide password");

      toggleBtn?.click();
      fixture.detectChanges();

      expect(input?.type).toBe("password");
      expect(toggleBtn?.getAttribute("aria-label")).toBe("Show password");
    });
  });

  describe("Error State & Accessibility", () => {
    it("should not mark input as aria-invalid when there are no errors", () => {
      const input = element.querySelector<HTMLInputElement>("#test-text-input input");
      expect(input?.getAttribute("aria-invalid")).toBeNull();
    });

    it("should render error messages, set aria-invalid='true', and apply destructive border on errors", () => {
      hostComponent.errors.set([{ message: "Username is already taken" }]);
      fixture.detectChanges();

      const input = element.querySelector<HTMLInputElement>("#test-text-input input");
      expect(input?.getAttribute("aria-invalid")).toBe("true");
      expect(input?.className).toContain("border-[var(--destructive)]");

      const errorList = element.querySelector<HTMLUListElement>("#test-text-input ul");
      expect(errorList).not.toBeNull();
      expect(errorList?.getAttribute("role")).toBe("alert");
      expect(errorList?.getAttribute("aria-live")).toBe("polite");
      expect(errorList?.textContent).toContain("Username is already taken");

      const errorId = errorList?.getAttribute("id");
      expect(input?.getAttribute("aria-describedby")).toBe(errorId);
    });
  });

  describe("Disabled State", () => {
    it("should disable input when disabled input is true", () => {
      const input = element.querySelector<HTMLInputElement>("#test-disabled-input input");
      expect(input?.disabled).toBe(true);
      expect(input?.className).toContain("disabled:cursor-not-allowed");
      expect(input?.className).toContain("disabled:opacity-50");
    });

    it("should disable input when FormControl is disabled via CVA setDisabledState", () => {
      const input = element.querySelector<HTMLInputElement>("#test-text-input input");
      expect(input?.disabled).toBe(false);

      hostComponent.textControl.disable();
      fixture.detectChanges();

      expect(input?.disabled).toBe(true);

      hostComponent.textControl.enable();
      fixture.detectChanges();

      expect(input?.disabled).toBe(false);
    });
  });
});
