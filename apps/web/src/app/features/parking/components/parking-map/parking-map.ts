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

// Fix Leaflet default marker icon paths for bundlers
/* SAFETY: Deleting internal Leaflet prototype method to allow custom marker icons */
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
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
      this.marker = L.marker(latlng).addTo(this.map);
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
