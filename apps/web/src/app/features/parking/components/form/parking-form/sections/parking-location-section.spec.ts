import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { Coordinates } from "@core/type/coordinates.type";

import type { CoordinateSummary } from "./parking-location-section";
import { ParkingLocationSectionComponent } from "./parking-location-section";

@Component({
  imports: [ParkingLocationSectionComponent],
  standalone: true,
  template: `
    <app-parking-location-section
      [initialPosition]="initialPosition()"
      [coordinates]="coordinates()"
      [hasCoordinates]="hasCoordinates()"
      [showPlaceholder]="showPlaceholder()"
      [placeholderText]="placeholderText()"
      (positionChange)="onPositionChange($event)"
      (mapInteracted)="onMapInteracted()"
    />
  `,
})
class TestHostComponent {
  public initialPosition = signal<Coordinates | null | undefined>(null);
  public coordinates = signal<CoordinateSummary[]>([
    { coordinates: "4,6097", label: "Latitud" },
    { coordinates: "-74,0817", label: "Longitud" },
  ]);
  public hasCoordinates = signal(false);
  public showPlaceholder = signal(true);
  public placeholderText = signal("Haz clic para interactuar");

  public lastEmittedPosition: Coordinates | null = null;
  public mapInteractedCalled = false;

  public onPositionChange(coords: Coordinates): void {
    this.lastEmittedPosition = coords;
  }

  public onMapInteracted(): void {
    this.mapInteractedCalled = true;
  }
}

describe("ParkingLocationSectionComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, ParkingLocationSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the component instance via host", () => {
    expect(hostComponent).toBeTruthy();
  });

  describe("placeholder display", () => {
    it("should show placeholder overlay when showPlaceholder is true", () => {
      hostComponent.showPlaceholder.set(true);
      fixture.detectChanges();

      const placeholderEl = fixture.nativeElement.querySelector(
        ".location-placeholder"
      );
      expect(placeholderEl).toBeTruthy();
      expect(placeholderEl?.textContent?.trim()).toContain(
        "Haz clic para interactuar"
      );
    });

    it("should hide placeholder overlay when showPlaceholder is false", () => {
      hostComponent.showPlaceholder.set(false);
      fixture.detectChanges();

      const placeholderEl = fixture.nativeElement.querySelector(
        ".location-placeholder"
      );
      expect(placeholderEl).toBeNull();
    });
  });

  describe("coordinates summary display", () => {
    it("should not show coordinate boxes when hasCoordinates is false", () => {
      hostComponent.hasCoordinates.set(false);
      fixture.detectChanges();

      const coordinateBoxes = fixture.nativeElement.querySelectorAll(
        ".grid.grid-cols-1.font-mono"
      );
      expect(coordinateBoxes.length).toBe(0);
    });

    it("should show coordinate summary when hasCoordinates is true", () => {
      hostComponent.hasCoordinates.set(true);
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent || "";
      expect(text).toContain("Latitud:");
      expect(text).toContain("4,6097");
      expect(text).toContain("Longitud:");
      expect(text).toContain("-74,0817");
    });
  });

  describe("outputs", () => {
    it("should emit mapInteracted when map wrapper container is clicked", () => {
      /* SAFETY: Querying rendered container element in fixture */
      const container = fixture.nativeElement.querySelector(
        ".relative.flex.flex-col.gap-3"
      ) as HTMLElement;
      container.click();

      expect(hostComponent.mapInteractedCalled).toBe(true);
    });

    it("should forward positionChange output when child parking map emits", () => {
      /* SAFETY: Accessing child ParkingLocationSectionComponent instance */
      const locationSection = fixture.debugElement.children[0]
        .componentInstance as ParkingLocationSectionComponent;

      const coords: Coordinates = { latitude: 6.2442, longitude: -75.5812 };
      locationSection.positionChange.emit(coords);

      expect(hostComponent.lastEmittedPosition).toEqual(coords);
    });
  });
});
