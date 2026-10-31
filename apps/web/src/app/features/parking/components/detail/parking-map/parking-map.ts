import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  afterNextRender,
  viewChild,
  effect,
} from "@angular/core";
import type { Coordinates } from "@core/type/coordinates.type";
import L from "leaflet";

const DEFAULT_CENTER: L.LatLngExpression = [4.711, -74.0721];
const DEFAULT_ZOOM = 13;
const CARTO_DARK_TILES =
  "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const NIVO_PIN_ICON = L.divIcon({
  className: "nivo-map-marker-container",
  html: `<div class="relative flex items-center justify-center w-8 h-8 pointer-events-none select-none">
    <span class="absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping bg-emerald-500"></span>
    <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-zinc-950 border-2 border-emerald-500 shadow-md text-emerald-400">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
    </div>
  </div>`,
  iconAnchor: [16, 16],
  iconSize: [32, 32],
});

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "app-parking-map",
  styleUrl: "./parking-map.css",
  templateUrl: "./parking-map.html",
})
export class ParkingMapComponent implements OnDestroy {
  private readonly mapContainer =
    viewChild<ElementRef<HTMLDivElement>>("mapContainer");

  readonly initialPosition = input<Coordinates | null | undefined>(null);
  readonly readonly = input<boolean>(false);
  readonly positionChange = output<Coordinates>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;

  constructor() {
    // Sync marker position when initialPosition changes after map is ready
    effect(() => {
      const position = this.initialPosition();
      if (ParkingMapComponent.isValidCoordinates(position) && this.map) {
        this.setMarkerPosition(position.latitude, position.longitude);
      }
    });

    // Initialize Leaflet map after the DOM element is available
    afterNextRender(() => {
      this.initMap();
    });
  }

  private initMap(): void {
    const container = this.mapContainer()?.nativeElement;
    if (!container || this.map) {
      return;
    }

    const initialPos = this.initialPosition();
    const center: L.LatLngExpression = ParkingMapComponent.isValidCoordinates(
      initialPos
    )
      ? [initialPos.latitude, initialPos.longitude]
      : DEFAULT_CENTER;

    this.map = new L.Map(container, {
      center,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    });

    L.tileLayer(CARTO_DARK_TILES, {
      attribution: CARTO_ATTRIBUTION,
      maxZoom: 20,
      subdomains: ["a", "b", "c", "d"],
    }).addTo(this.map);

    // Show initial marker if position is provided
    if (ParkingMapComponent.isValidCoordinates(initialPos)) {
      this.setMarkerPosition(initialPos.latitude, initialPos.longitude);
    }

    // Only allow click-to-place when not readonly
    if (!this.readonly()) {
      this.map.on("click", (event: L.LeafletMouseEvent) => {
        this.onMapClick(event.latlng);
      });
    }
  }

  private onMapClick(latlng: L.LatLng): void {
    this.setMarkerPosition(latlng.lat, latlng.lng);
    this.positionChange.emit({ latitude: latlng.lat, longitude: latlng.lng });
  }

  private setMarkerPosition(latitude: number, longitude: number): void {
    const latlng = L.latLng(latitude, longitude);

    if (this.marker) {
      this.marker.setLatLng(latlng);
    } else if (this.map) {
      this.marker = L.marker(latlng, { icon: NIVO_PIN_ICON }).addTo(this.map);
    }

    // Pan map to marker position
    this.map?.panTo(latlng);
  }

  private static isValidCoordinates(
    coordinates: Coordinates | null | undefined
  ): coordinates is Coordinates {
    return (
      !!coordinates &&
      Number.isFinite(coordinates.latitude) &&
      Number.isFinite(coordinates.longitude)
    );
  }

  ngOnDestroy(): void {
    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
