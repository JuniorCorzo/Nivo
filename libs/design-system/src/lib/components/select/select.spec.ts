import { ChangeDetectionStrategy, Component, viewChild } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

import { SelectComponent } from "./select";

interface TestOption {
  id: string;
  label: string;
}

const testDisplayFn = (item: TestOption): string => item.label;
const testValueFn = (item: TestOption): string => item.id;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SelectComponent, ReactiveFormsModule],
  standalone: true,
  template: `
    <nv-select
      id="test-select"
      [placeholder]="placeholder"
      [items]="items"
      [displayFn]="displayFn"
      [valueFn]="valueFn"
      [formControl]="control"
      (valueChange)="onValueChange($event)"
      (selectionChange)="onSelectionChange($event)"
    />
  `,
})
class TestHostComponent {
  readonly selectComponent = viewChild.required(SelectComponent<TestOption>);
  readonly displayFn = testDisplayFn;
  readonly valueFn = testValueFn;
  placeholder = "Select an option";
  items: TestOption[] = [
    { id: "1", label: "Option 1" },
    { id: "2", label: "Option 2" },
  ];
  readonly control = new FormControl("");
  lastValueChange?: string;
  lastSelectionChange?: TestOption;

  onValueChange(val: string): void {
    this.lastValueChange = val;
  }

  onSelectionChange(item: TestOption): void {
    this.lastSelectionChange = item;
  }
}

describe("SelectComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let hostComponent: TestHostComponent;
  let selectComponent: SelectComponent<TestOption>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    /* SAFETY: The test fixture native element is a DOM HTMLElement */
    element = fixture.nativeElement as HTMLElement;
    selectComponent = hostComponent.selectComponent();
  });

  it("renders with placeholder", () => {
    const trigger = element.querySelector<HTMLButtonElement>("button");
    expect(trigger).not.toBeNull();
    expect(trigger?.textContent).toContain("Select an option");
    expect(selectComponent.triggerText()).toBe("Select an option");
  });

  it("optionClasses returns hover and selected classes without data-[active=true]:bg-accent", () => {
    const [item1] = hostComponent.items;
    const unselectedClasses = selectComponent.optionClasses(item1);

    expect(unselectedClasses).toContain("hover:bg-accent");
    expect(unselectedClasses).toContain("hover:text-accent-foreground");
    expect(unselectedClasses).not.toContain("data-[active=true]:bg-accent");
    expect(unselectedClasses).not.toContain(
      "data-[active=true]:text-accent-foreground"
    );
    expect(unselectedClasses).not.toContain("font-medium");

    selectComponent.writeValue("1");
    const selectedClasses = selectComponent.optionClasses(item1);

    expect(selectedClasses).toContain("bg-accent text-accent-foreground font-medium");
    expect(selectedClasses).not.toContain("data-[active=true]:bg-accent");
    expect(selectedClasses).not.toContain(
      "data-[active=true]:text-accent-foreground"
    );
  });

  it("toggles overlay on click", () => {
    const trigger = element.querySelector<HTMLButtonElement>("button");
    expect(selectComponent.isOpen()).toBe(false);
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");

    trigger?.click();
    fixture.detectChanges();

    expect(selectComponent.isOpen()).toBe(true);
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");

    trigger?.click();
    fixture.detectChanges();

    expect(selectComponent.isOpen()).toBe(false);
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  });

  it("selects an item and emits valueChange / selectionChange", () => {
    const [, item2] = hostComponent.items;
    selectComponent.selectItem(item2);
    fixture.detectChanges();

    expect(hostComponent.lastValueChange).toBe("2");
    expect(hostComponent.lastSelectionChange).toEqual(item2);
    expect(selectComponent.isOpen()).toBe(false);

    const trigger = element.querySelector<HTMLButtonElement>("button");
    expect(trigger?.textContent).toContain("Option 2");
  });

  it("CVA writeValue updates internal value", () => {
    const [item1, item2] = hostComponent.items;
    selectComponent.writeValue("2");
    fixture.detectChanges();

    expect(selectComponent.selectedItem()).toEqual(item2);
    expect(selectComponent.triggerText()).toBe("Option 2");

    const trigger = element.querySelector<HTMLButtonElement>("button");
    expect(trigger?.textContent).toContain("Option 2");

    selectComponent.writeValue("");
    fixture.detectChanges();

    expect(selectComponent.selectedItem()).toBeUndefined();
    expect(selectComponent.triggerText()).toBe("Select an option");

    selectComponent.writeValue("1");
    fixture.detectChanges();
    expect(selectComponent.selectedItem()).toEqual(item1);
  });
});
