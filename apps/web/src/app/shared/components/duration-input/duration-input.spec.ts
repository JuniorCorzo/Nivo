import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import type { ValidationError } from "@angular/forms/signals";
import { By } from "@angular/platform-browser";
import { InputComponent, SelectComponent } from "@nivo-sass/design-system";

import { DurationInputComponent } from "./duration-input";

@Component({
  imports: [DurationInputComponent, ReactiveFormsModule],
  standalone: true,
  template: `
    <app-duration-input
      [formControl]="control"
      [label]="label()"
      [id]="id()"
      [error]="error()"
    />
  `,
})
class TestHostComponent {
  readonly control = new FormControl<number>(0);
  readonly label = signal("Tiempo de gracia");
  readonly id = signal("grace-duration");
  readonly error = signal<
    string | ValidationError.WithFieldTree[] | undefined
  >(undefined);
}

describe("DurationInputComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let component: DurationInputComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    component = fixture.debugElement.query(
      By.directive(DurationInputComponent)
    ).componentInstance;
    fixture.detectChanges();
  });

  it("should render nv-input and nv-select components in template", () => {
    const inputDebug = fixture.debugElement.query(By.directive(InputComponent));
    const selectDebug = fixture.debugElement.query(
      By.directive(SelectComponent)
    );

    expect(inputDebug).toBeTruthy();
    expect(selectDebug).toBeTruthy();
  });

  it("should initialize with default 0 minutes", () => {
    expect(component.amount()).toBe(0);
    expect(component.unit()).toBe("MINUTES");
  });

  it("should populate amount and unit on writeValue with hours divisible value", () => {
    host.control.setValue(120);
    fixture.detectChanges();

    expect(component.amount()).toBe(2);
    expect(component.unit()).toBe("HOURS");
  });

  it("should populate amount and unit on writeValue with days divisible value", () => {
    host.control.setValue(2880);
    fixture.detectChanges();

    expect(component.amount()).toBe(2);
    expect(component.unit()).toBe("DAYS");
  });

  it("should populate amount and unit on writeValue with non-divisible minutes", () => {
    host.control.setValue(45);
    fixture.detectChanges();

    expect(component.amount()).toBe(45);
    expect(component.unit()).toBe("MINUTES");
  });

  it("should propagate total minutes to form control when amount input event triggers in template", () => {
    const selectComp = fixture.debugElement.query(
      By.directive(SelectComponent)
    ).componentInstance;
    selectComp.valueChange.emit("HOURS");
    fixture.detectChanges();

    const inputEl: HTMLInputElement = fixture.debugElement.query(
      By.css("input")
    ).nativeElement;
    inputEl.value = "3";
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();

    expect(host.control.value).toBe(180);
  });

  it("should propagate total minutes to form control when unit select change triggers in template", () => {
    const inputEl: HTMLInputElement = fixture.debugElement.query(
      By.css("input")
    ).nativeElement;
    inputEl.value = "2";
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();

    const selectComp = fixture.debugElement.query(
      By.directive(SelectComponent)
    ).componentInstance;
    selectComp.valueChange.emit("DAYS");
    fixture.detectChanges();

    expect(host.control.value).toBe(2880);
  });

  it("should update disabled state and disable both child inputs", () => {
    host.control.disable();
    fixture.detectChanges();

    const inputComp = fixture.debugElement.query(
      By.directive(InputComponent)
    ).componentInstance;
    const selectComp = fixture.debugElement.query(
      By.directive(SelectComponent)
    ).componentInstance;

    expect(component.disabled()).toBe(true);
    expect(inputComp.disabled()).toBe(true);
    expect(selectComp.disabled()).toBe(true);

    host.control.enable();
    fixture.detectChanges();

    expect(component.disabled()).toBe(false);
    expect(inputComp.disabled()).toBe(false);
    expect(selectComp.disabled()).toBe(false);
  });

  it("should normalize string error into ValidationError array", () => {
    host.error.set("Campo requerido");
    fixture.detectChanges();

    expect(component.normalizedError()).toEqual([
      { message: "Campo requerido" },
    ]);
  });
});
