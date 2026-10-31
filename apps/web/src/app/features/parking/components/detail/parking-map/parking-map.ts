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
const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const createParkingMarkerIcon = (name?: string | null): L.DivIcon => {
  const displayName = name?.trim() || "Sede de Parqueo";
  return L.divIcon({
    className: "nivo-map-marker-container",
    html: `<div class="relative flex flex-col items-center -translate-x-1/2 -translate-y-full pointer-events-none select-none">
  <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-950/95 border border-success/50 text-white text-xs font-bold shadow-xl backdrop-blur-md whitespace-nowrap mb-1">
    <span class="relative flex h-2 w-2 shrink-0">
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75"></span>
      <span class="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
    </span>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="text-success shrink-0">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
    <span class="truncate max-w-[180px]">${displayName}</span>
  </div>
  <div class="flex flex-col items-center">
    <div class="w-3 h-3 bg-success rounded-full ring-4 ring-success/20 shadow-md"></div>
    <div class="w-0.5 h-1.5 bg-success/80"></div>
  </div>
</div>`,
    iconAnchor: [0, 0],
    iconSize: [0, 0],
  });
};

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
  readonly parkingName = input<string | null | undefined>(null);
  readonly readonly = input<boolean>(false);
  readonly positionChange = output<Coordinates>();

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    // Sync marker position & icon when position or name changes after map is ready
    effect(() => {
      const position = this.initialPosition();
      const name = this.parkingName();
      if (this.marker) {
        this.marker.setIcon(createParkingMarkerIcon(name));
      }
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

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(this.map);

    if ("ResizeObserver" in globalThis) {
      this.resizeObserver = new ResizeObserver(() => {
        this.map?.invalidateSize();
      });
      this.resizeObserver.observe(container);
    }
    setTimeout(() => this.map?.invalidateSize(), 0);

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
      this.marker.setIcon(createParkingMarkerIcon(this.parkingName()));
    } else if (this.map) {
      this.marker = L.marker(latlng, {
        icon: createParkingMarkerIcon(this.parkingName()),
      }).addTo(this.map);
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
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
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
