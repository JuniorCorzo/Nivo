import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { ParkingEmptyState } from "./parking-empty-state";

@Component({
  imports: [ParkingEmptyState],
  standalone: true,
  template: ` <app-parking-empty-state (create)="onCreated()" /> `,
})
class TestHostComponent {
  public createdCalled = signal(false);

  public onCreated(): void {
    this.createdCalled.set(true);
  }
}

describe("ParkingEmptyState", () => {
  let hostComponent: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ParkingEmptyState],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
    compiled = fixture.nativeElement;
  });

  it("should render the empty state title, description and button", () => {
    const textContent = compiled.textContent || "";
    expect(textContent).toContain("No tienes parqueaderos registrados");
    expect(textContent).toContain("Comienza agregando tu primer parqueadero");
    expect(textContent).toContain("Crear Parqueadero");
  });

  it("should emit create output when button is clicked", () => {
    /* SAFETY: Querying rendered button element in fixture */
    const button = compiled.querySelector(
      "nv-button button, nv-button"
    ) as HTMLElement | null;
    button?.click();
    expect(hostComponent.createdCalled()).toBe(true);
  });
});
