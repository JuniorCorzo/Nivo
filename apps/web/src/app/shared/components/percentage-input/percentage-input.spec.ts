import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import type { ValidationError } from "@angular/forms/signals";
import { By } from "@angular/platform-browser";
import { InputComponent } from "@nivo-sass/design-system";

import { PercentageInputComponent } from "./percentage-input";

@Component({
  imports: [PercentageInputComponent, ReactiveFormsModule],
  standalone: true,
  template: `
    <app-percentage-input
      [formControl]="control"
      [label]="label()"
      [id]="id()"
      [placeholder]="placeholder()"
      [error]="error()"
    />
  `,
})
class TestHostComponent {
  readonly control = new FormControl<number>(0.19);
  readonly label = signal("Tasa IVA (%)");
  readonly id = signal("iva-rate-input");
  readonly placeholder = signal("19");
  readonly error = signal<
    string | ValidationError.WithFieldTree[] | undefined
  >(undefined);
}

describe("PercentageInputComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: PercentageInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(PercentageInputComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it("should render nv-input with label and placeholder", () => {
    const inputDebug = fixture.debugElement.query(By.directive(InputComponent));
    expect(inputDebug).toBeTruthy();
    expect(inputDebug.componentInstance.label()).toBe("Tasa IVA (%)");
    expect(inputDebug.componentInstance.placeholder()).toBe("19");
  });

  it("should populate percentage display from decimal rate on writeValue", () => {
    expect(component.percentage()).toBe(19);

    host.control.setValue(0.08);
    fixture.detectChanges();

    expect(component.percentage()).toBe(8);
  });

  it("should emit decimal rate to form control when percentage input changes in template", () => {
    const inputEl: HTMLInputElement = fixture.debugElement.query(
      By.css("input")
    ).nativeElement;
    inputEl.value = "16";
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();

    expect(host.control.value).toBe(0.16);
  });

  it("should update disabled state and disable child nv-input", () => {
    host.control.disable();
    fixture.detectChanges();

    const inputComp = fixture.debugElement.query(
      By.directive(InputComponent)
    ).componentInstance;
    expect(component.disabled()).toBe(true);
    expect(inputComp.disabled()).toBe(true);

    host.control.enable();
    fixture.detectChanges();

    expect(component.disabled()).toBe(false);
    expect(inputComp.disabled()).toBe(false);
  });

  it("should normalize string error into ValidationError array", () => {
    host.error.set("Tasa inválida");
    fixture.detectChanges();

    expect(component.normalizedError()).toEqual([
      { message: "Tasa inválida" } as ValidationError.WithFieldTree,
    ]);
  });
});
