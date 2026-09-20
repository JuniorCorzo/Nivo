import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CheckboxComponent } from "./checkbox";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CheckboxComponent, FormsModule, ReactiveFormsModule],
  standalone: true,
  template: `
    <nv-checkbox
      id="default-cb"
      label="Accept terms"
      [(checked)]="isChecked"
      (change)="onChange($event)"
    />

    <nv-checkbox
      id="disabled-cb"
      label="Disabled checkbox"
      [disabled]="true"
      [(checked)]="isDisabledChecked"
      (change)="onChange($event)"
    />

    <nv-checkbox
      id="indeterminate-cb"
      label="Indeterminate checkbox"
      [indeterminate]="isIndeterminate()"
    />

    <nv-checkbox id="projected-cb">
      <span class="projected-label">Custom projected text</span>
    </nv-checkbox>

    <nv-checkbox id="form-cb" [formControl]="control" />
  `,
})
class TestHostComponent {
  readonly control = new FormControl(false);
  isChecked = false;
  isDisabledChecked = false;
  readonly isIndeterminate = signal(true);
  lastChangeEvent: boolean | null = null;

  onChange(val: boolean): void {
    this.lastChangeEvent = val;
  }
}

describe("CheckboxComponent", () => {
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
    /* SAFETY: Test fixture native element is an HTMLElement */
    element = fixture.nativeElement as HTMLElement;
  });

  it("should render unchecked by default with proper aria attributes", () => {
    const btn = element.querySelector<HTMLButtonElement>("#default-cb button");
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute("role")).toBe("checkbox");
    expect(btn?.getAttribute("aria-checked")).toBe("false");
    expect(btn?.disabled).toBe(false);
    expect(btn?.querySelector("svg")).toBeNull();

    const labelSpan = element.querySelector("#default-cb span");
    expect(labelSpan?.textContent?.trim()).toBe("Accept terms");
  });

  it("should toggle on click and emit checkedChange and change", () => {
    const btn = element.querySelector<HTMLButtonElement>("#default-cb button");
    expect(btn).not.toBeNull();

    btn?.click();
    fixture.detectChanges();

    expect(hostComponent.isChecked).toBe(true);
    expect(hostComponent.lastChangeEvent).toBe(true);
    expect(btn?.getAttribute("aria-checked")).toBe("true");

    const svg = btn?.querySelector("svg");
    expect(svg).not.toBeNull();
    const path = svg?.querySelector("path");
    expect(path?.getAttribute("d")).toBe("M5 13l4 4L19 7");

    btn?.click();
    fixture.detectChanges();

    expect(hostComponent.isChecked).toBe(false);
    expect(hostComponent.lastChangeEvent).toBe(false);
    expect(btn?.getAttribute("aria-checked")).toBe("false");
    expect(btn?.querySelector("svg")).toBeNull();
  });

  it("should toggle when clicking label text", () => {
    const labelSpan = element.querySelector<HTMLSpanElement>("#default-cb label span");
    expect(labelSpan).not.toBeNull();

    labelSpan?.click();
    fixture.detectChanges();

    expect(hostComponent.isChecked).toBe(true);
    expect(hostComponent.lastChangeEvent).toBe(true);
  });

  it("should prevent toggle when disabled", () => {
    const btn = element.querySelector<HTMLButtonElement>("#disabled-cb button");
    expect(btn).not.toBeNull();
    expect(btn?.disabled).toBe(true);
    expect(btn?.getAttribute("aria-disabled")).toBe("true");

    btn?.click();
    fixture.detectChanges();

    expect(hostComponent.isDisabledChecked).toBe(false);
    expect(hostComponent.lastChangeEvent).toBeNull();
  });

  it("should render minus icon and aria-checked='mixed' when indeterminate", () => {
    const btn = element.querySelector<HTMLButtonElement>("#indeterminate-cb button");
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute("aria-checked")).toBe("mixed");

    const svg = btn?.querySelector("svg");
    expect(svg).not.toBeNull();
    const path = svg?.querySelector("path");
    expect(path?.getAttribute("d")).toBe("M5 12h14");

    hostComponent.isIndeterminate.set(false);
    fixture.detectChanges();

    expect(btn?.getAttribute("aria-checked")).toBe("false");
    expect(btn?.querySelector("svg")).toBeNull();
  });

  it("should integrate with ControlValueAccessor (writeValue and form control)", () => {
    const btn = element.querySelector<HTMLButtonElement>("#form-cb button");
    expect(btn).not.toBeNull();
    expect(btn?.getAttribute("aria-checked")).toBe("false");

    hostComponent.control.setValue(true);
    fixture.detectChanges();

    expect(btn?.getAttribute("aria-checked")).toBe("true");
    expect(btn?.querySelector("svg")).not.toBeNull();

    btn?.click();
    fixture.detectChanges();

    expect(hostComponent.control.value).toBe(false);

    hostComponent.control.disable();
    fixture.detectChanges();

    expect(btn?.disabled).toBe(true);
    expect(btn?.getAttribute("aria-disabled")).toBe("true");
  });

  it("should render label and support content projection", () => {
    const projectedSpan = element.querySelector("#projected-cb .projected-label");
    expect(projectedSpan).not.toBeNull();
    expect(projectedSpan?.textContent?.trim()).toBe("Custom projected text");
  });

  it("should toggle on Space key press", () => {
    const btn = element.querySelector<HTMLButtonElement>("#default-cb button");
    expect(btn).not.toBeNull();

    const spaceEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: " ",
    });
    btn?.dispatchEvent(spaceEvent);
    fixture.detectChanges();

    expect(hostComponent.isChecked).toBe(true);

    btn?.dispatchEvent(spaceEvent);
    fixture.detectChanges();

    expect(hostComponent.isChecked).toBe(false);
  });
});
