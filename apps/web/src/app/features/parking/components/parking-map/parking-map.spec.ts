import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { Coordinates } from "@core/type/coordinates.type";
import L from "leaflet";

import { ParkingMapComponent } from "./parking-map";

interface ParkingMapStatic {
  isValidCoordinates: (coords: unknown) => boolean;
}

interface ParkingMapInternal {
  map: L.Map | null;
  marker: L.Marker | null;
  setMarkerPosition: (lat: number, lng: number) => void;
  onMapClick: (latlng: L.LatLng) => void;
}

interface PositionHolder {
  position?: Coordinates;
}

@Component({
  imports: [ParkingMapComponent],
  standalone: true,
  template: `
    <app-parking-map
      [initialPosition]="initialPosition()"
      [readonly]="readonly()"
      (positionChange)="onPositionChange($event)"
    />
  `,
})
class TestHostComponent {
  public initialPosition = signal<Coordinates | null>(null);
  public readonly = signal<boolean>(false);
  public lastEmittedPosition: Coordinates | null = null;

  public onPositionChange(coords: Coordinates): void {
    this.lastEmittedPosition = coords;
  }
}

describe("ParkingMapComponent", () => {
  let fixture: ComponentFixture<ParkingMapComponent>;
  let component: ParkingMapComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingMapComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the component instance", () => {
    expect(component).toBeTruthy();
  });

  describe("isValidCoordinates static validation", () => {
    it("should return true for valid finite coordinates", () => {
      /* SAFETY: Accessing private static method for testing */
      const mapStatic: ParkingMapStatic = ParkingMapComponent as never;
      const isValid = mapStatic.isValidCoordinates({
        latitude: 4.711,
        longitude: -74.0721,
      });
      expect(isValid).toBeTrue();
    });

    it("should return true for coordinates with zero values", () => {
      /* SAFETY: Accessing private static method for testing */
      const mapStatic: ParkingMapStatic = ParkingMapComponent as never;
      const isValid = mapStatic.isValidCoordinates({
        latitude: 0,
        longitude: 0,
      });
      expect(isValid).toBeTrue();
    });

    it("should return false for null or undefined coordinates", () => {
      /* SAFETY: Accessing private static method for testing */
      const mapStatic: ParkingMapStatic = ParkingMapComponent as never;
      expect(mapStatic.isValidCoordinates(null)).toBeFalse();
      const holder: PositionHolder = {};
      expect(mapStatic.isValidCoordinates(holder.position)).toBeFalse();
    });

    it("should return false for NaN or infinite coordinates", () => {
      /* SAFETY: Accessing private static method for testing */
      const mapStatic: ParkingMapStatic = ParkingMapComponent as never;
      expect(
        mapStatic.isValidCoordinates({
          latitude: Number.NaN,
          longitude: -74.0721,
        })
      ).toBeFalse();
      expect(
        mapStatic.isValidCoordinates({
          latitude: 4.711,
          longitude: Number.POSITIVE_INFINITY,
        })
      ).toBeFalse();
    });
  });

  describe("initialPosition input handling", () => {
    it("should initialize with null initialPosition by default", () => {
      expect(component.initialPosition()).toBeNull();
    });

    it("should accept valid initialPosition input", () => {
      const coords: Coordinates = { latitude: 6.2442, longitude: -75.5812 };
      fixture.componentRef.setInput("initialPosition", coords);
      fixture.detectChanges();

      expect(component.initialPosition()).toEqual(coords);
    });

    it("should update marker position when initialPosition changes after map is ready", () => {
      /* SAFETY: Accessing internal map state for unit testing */
      const privateComp: ParkingMapInternal = component as never;

      const container = document.createElement("div");
      privateComp.map = new L.Map(container, {
        center: [4.711, -74.0721],
        zoom: 13,
      });

      spyOn(privateComp, "setMarkerPosition").and.callThrough();

      fixture.componentRef.setInput("initialPosition", {
        latitude: 10.9685,
        longitude: -74.7813,
      });
      fixture.detectChanges();

      expect(privateComp.setMarkerPosition).toHaveBeenCalledWith(
        10.9685,
        -74.7813
      );
    });
  });

  describe("readonly mode and positionChange output", () => {
    it("should emit positionChange and update marker on map click when readonly is false", () => {
      let emittedCoords: Coordinates | undefined;
      component.positionChange.subscribe((coords) => {
        emittedCoords = coords;
      });

      /* SAFETY: Accessing internal methods for simulating map click */
      const privateComp: ParkingMapInternal = component as never;

      const container = document.createElement("div");
      privateComp.map = new L.Map(container, {
        center: [4.711, -74.0721],
        zoom: 13,
      });

      const clickLatLng = L.latLng(4.6097, -74.0817);
      privateComp.onMapClick(clickLatLng);

      expect(emittedCoords).toEqual({
        latitude: 4.6097,
        longitude: -74.0817,
      });
      expect(privateComp.marker).toBeTruthy();
      expect(privateComp.marker?.getLatLng().lat).toBe(4.6097);
      expect(privateComp.marker?.getLatLng().lng).toBe(-74.0817);
    });

    it("should update existing marker on subsequent map click", () => {
      /* SAFETY: Accessing internal methods for simulating map click */
      const privateComp: ParkingMapInternal = component as never;

      const container = document.createElement("div");
      privateComp.map = new L.Map(container, {
        center: [4.711, -74.0721],
        zoom: 13,
      });

      privateComp.onMapClick(L.latLng(4, -74));
      const firstMarker = privateComp.marker;

      privateComp.onMapClick(L.latLng(5, -73));
      expect(privateComp.marker).toBe(firstMarker);
      expect(privateComp.marker?.getLatLng().lat).toBe(5);
      expect(privateComp.marker?.getLatLng().lng).toBe(-73);
    });

    it("should respect readonly input set to true", () => {
      fixture.componentRef.setInput("readonly", true);
      fixture.detectChanges();

      expect(component.readonly()).toBeTrue();
    });
  });

  describe("cleanup on ngOnDestroy", () => {
    it("should remove marker and map upon ngOnDestroy", () => {
      /* SAFETY: Accessing internal map state for unit testing */
      const privateComp: ParkingMapInternal = component as never;

      const container = document.createElement("div");
      privateComp.map = new L.Map(container, {
        center: [4.711, -74.0721],
        zoom: 13,
      });
      privateComp.marker = L.marker([4.711, -74.0721]).addTo(privateComp.map);

      const mapRemoveSpy = spyOn(privateComp.map, "remove").and.callThrough();
      const markerRemoveSpy = spyOn(
        privateComp.marker,
        "remove"
      ).and.callThrough();

      component.ngOnDestroy();

      expect(markerRemoveSpy).toHaveBeenCalled();
      expect(mapRemoveSpy).toHaveBeenCalled();
      expect(privateComp.marker).toBeNull();
      expect(privateComp.map).toBeNull();
    });

    it("should handle ngOnDestroy when map and marker were never initialized", () => {
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
