import { CommonModule } from "@angular/common";
import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  ViewChild,
  effect,
  input,
  output,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { VehicleType } from "@core/models/rate.model";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideAlertCircle,
  lucideCamera,
  lucideCheck,
  lucideKeyboard,
  lucideQrCode,
  lucideRefreshCw,
  lucideScanLine,
  lucideX,
} from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";

export interface ScannedQrData {
  ticketId?: string;
  plate?: string;
  vehicleType?: VehicleType;
}

interface DetectedBarcode {
  readonly rawValue: string;
}

interface NativeBarcodeDetector {
  readonly detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
}

type BarcodeDetectorConstructor = new (options?: {
  formats: string[];
}) => NativeBarcodeDetector;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

const isTicketIdCandidate = (val: string): boolean => {
  if (!val) {
    return false;
  }
  if (UUID_REGEX.test(val)) {
    return true;
  }
  if (val.startsWith("TKT-") || val.startsWith("T-")) {
    return true;
  }
  return false;
};

const sanitizePlate = (value: string): string =>
  value.replaceAll(/[^a-zA-Z0-9]/gu, "").toUpperCase();

const resolveVehicleType = (rawType: string): VehicleType | undefined => {
  const normalized = rawType.toUpperCase();
  if (
    normalized === "CAR" ||
    normalized === "MOTORCYCLE" ||
    normalized === "BIKE"
  ) {
    /* SAFETY: Checked against valid VehicleType union values */
    return normalized as VehicleType;
  }
  return undefined;
};

const parseJsonPayload = (trimmed: string): ScannedQrData | null => {
  if (!trimmed.startsWith("{") || !trimmed.endsWith("}")) {
    return null;
  }
  try {
    /* SAFETY: JSON parsed structure narrowed via field access */
    const parsed = JSON.parse(trimmed) as {
      ticketId?: string;
      id?: string;
      plate?: string;
      licensePlate?: string;
      type?: string;
      vehicleType?: string;
    };
    const ticketId = parsed.ticketId ?? parsed.id;
    const rawPlate = parsed.plate ?? parsed.licensePlate;
    const cleanPlate = rawPlate ? sanitizePlate(rawPlate) : undefined;
    const rawType = parsed.type ?? parsed.vehicleType ?? "";
    const vehicleType = resolveVehicleType(rawType);

    if (
      ticketId ||
      (cleanPlate && cleanPlate.length >= 3 && cleanPlate.length <= 8)
    ) {
      return {
        plate:
          cleanPlate && cleanPlate.length >= 3 && cleanPlate.length <= 8
            ? cleanPlate
            : undefined,
        ticketId: ticketId ? ticketId.trim() : undefined,
        vehicleType,
      };
    }
    return null;
  } catch {
    return null;
  }
};

const extractQueryParams = (url: URL) => {
  const ticketIdParam =
    url.searchParams.get("ticketId") ??
    url.searchParams.get("id") ??
    url.searchParams.get("t");
  const plateParam =
    url.searchParams.get("plate") ??
    url.searchParams.get("licensePlate") ??
    url.searchParams.get("p");
  const typeParam =
    url.searchParams.get("type") ??
    url.searchParams.get("vehicleType") ??
    url.searchParams.get("v");

  return {
    cleanPlate: plateParam ? sanitizePlate(plateParam) : undefined,
    ticketId: ticketIdParam ? ticketIdParam.trim() : undefined,
    vehicleType: resolveVehicleType(typeParam ?? ""),
  };
};

interface ExtractedPathData {
  readonly cleanPlate?: string;
  readonly ticketId?: string;
}

const extractPathData = (url: URL): ExtractedPathData => {
  const segments = url.pathname.split("/").filter(Boolean);
  const lastSegment = segments.at(-1) ?? "";
  if (!lastSegment) {
    return {};
  }
  if (isTicketIdCandidate(lastSegment)) {
    return { ticketId: lastSegment };
  }
  const candidatePlate = sanitizePlate(lastSegment);
  if (candidatePlate.length >= 3 && candidatePlate.length <= 8) {
    return { cleanPlate: candidatePlate };
  }
  if (
    segments.includes("t") ||
    segments.includes("tickets") ||
    segments.includes("public-ticket")
  ) {
    return { ticketId: lastSegment };
  }
  return {};
};

const parseUrlPayload = (trimmed: string): ScannedQrData | null => {
  const isUrl =
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/");
  if (!isUrl) {
    return null;
  }
  try {
    const url = new URL(trimmed, "https://nivo.app");
    const queryData = extractQueryParams(url);
    let { cleanPlate, ticketId } = queryData;

    // Si no viene en query param, extraer del path: /t/:id, /tickets/:id, etc.
    if (!ticketId && !cleanPlate) {
      const { cleanPlate: pathPlate, ticketId: pathTicketId } =
        extractPathData(url);
      ticketId = pathTicketId;
      cleanPlate = pathPlate;
    }

    if (ticketId || cleanPlate) {
      return {
        plate: cleanPlate,
        ticketId,
        vehicleType: queryData.vehicleType,
      };
    }
    return null;
  } catch {
    return null;
  }
};

export const parseScannedData = (raw: string): ScannedQrData | null => {
  if (!raw) {
    return null;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }

  const jsonResult = parseJsonPayload(trimmed);
  if (jsonResult) {
    return jsonResult;
  }

  const urlResult = parseUrlPayload(trimmed);
  if (urlResult) {
    return urlResult;
  }

  if (isTicketIdCandidate(trimmed)) {
    return { ticketId: trimmed };
  }

  const cleanPlate = sanitizePlate(trimmed);
  if (cleanPlate.length >= 3 && cleanPlate.length <= 8) {
    return { plate: cleanPlate };
  }

  return null;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, ButtonComponent, CommonModule, FormsModule, NgIcon],
  providers: [
    provideIcons({
      lucideAlertCircle,
      lucideCamera,
      lucideCheck,
      lucideKeyboard,
      lucideQrCode,
      lucideRefreshCw,
      lucideScanLine,
      lucideX,
    }),
  ],
  selector: "app-qr-scanner-modal",
  standalone: true,
  styleUrl: "./qr-scanner-modal.css",
  templateUrl: "./qr-scanner-modal.html",
})
export class QrScannerModalComponent implements OnDestroy {
  readonly isOpen = input<boolean>(false);
  readonly parkingId = input<string | null>(null);

  readonly scanned = output<ScannedQrData>();
  readonly closed = output();

  @ViewChild("videoElement") videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild("manualInputRef") manualInputRef?: ElementRef<HTMLInputElement>;

  readonly isCameraActive = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly manualInputValue = signal<string>("");
  readonly isScanning = signal<boolean>(false);

  private mediaStream: MediaStream | null = null;
  private scanIntervalId: ReturnType<typeof setInterval> | null = null;
  private barcodeDetectorInstance: NativeBarcodeDetector | null = null;

  constructor() {
    effect(() => {
      if (this.isOpen()) {
        this.resetState();
        this.startCamera();
        setTimeout(() => {
          this.manualInputRef?.nativeElement.focus();
        }, 100);
      } else {
        this.stopCamera();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  resetState(): void {
    this.errorMessage.set(null);
    this.manualInputValue.set("");
    this.isScanning.set(false);
  }

  async startCamera(): Promise<void> {
    this.errorMessage.set(null);
    if (!navigator?.mediaDevices?.getUserMedia) {
      this.errorMessage.set("Cámara no disponible en este dispositivo");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
      });
      this.mediaStream = stream;
      this.isCameraActive.set(true);

      setTimeout(() => {
        if (this.videoRef?.nativeElement) {
          this.videoRef.nativeElement.srcObject = stream;
          this.initBarcodeDetector();
        }
      }, 50);
    } catch {
      this.errorMessage.set(
        "No se pudo acceder a la cámara. Usa el lector manual."
      );
      this.isCameraActive.set(false);
    }
  }

  stopCamera(): void {
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId);
      this.scanIntervalId = null;
    }
    if (this.mediaStream) {
      try {
        if ("getTracks" in this.mediaStream) {
          const tracks = this.mediaStream.getTracks();
          if (Array.isArray(tracks)) {
            for (const track of tracks) {
              track?.stop?.();
            }
          }
        }
      } catch {
        // stream already closed or tracks not accessible
      }
      this.mediaStream = null;
    }
    this.isCameraActive.set(false);
    this.isScanning.set(false);
  }

  private initBarcodeDetector(): void {
    /* SAFETY: Narrow window object to access optional BarcodeDetector API */
    const globalWindow = window as Window & {
      BarcodeDetector?: BarcodeDetectorConstructor;
    };
    if (!globalWindow.BarcodeDetector) {
      return;
    }

    try {
      const Detector = globalWindow.BarcodeDetector;
      this.barcodeDetectorInstance = new Detector({ formats: ["qr_code"] });
      this.startBarcodeScanningLoop();
    } catch {
      // BarcodeDetector initialization fallback
    }
  }

  private startBarcodeScanningLoop(): void {
    if (this.scanIntervalId) {
      clearInterval(this.scanIntervalId);
    }

    this.isScanning.set(true);
    this.scanIntervalId = setInterval(async () => {
      const video = this.videoRef?.nativeElement;
      if (
        !video ||
        video.readyState < 2 ||
        !this.barcodeDetectorInstance ||
        !this.isOpen()
      ) {
        return;
      }

      try {
        const barcodes = await this.barcodeDetectorInstance.detect(video);
        if (barcodes.length > 0) {
          const raw = barcodes[0]?.rawValue ?? "";
          const parsed = parseScannedData(raw);
          if (parsed) {
            this.handleSuccessfulScan(parsed);
          }
        }
      } catch {
        // Frame detection skipped
      }
    }, 250);
  }

  handleSuccessfulScan(data: ScannedQrData): void {
    this.stopCamera();
    this.scanned.emit(data);
    this.closed.emit();
  }

  onManualInputSubmit(): void {
    const raw = this.manualInputValue().trim();
    if (!raw) {
      this.errorMessage.set("Ingresa un código QR o placa válida.");
      return;
    }

    const parsed = parseScannedData(raw);
    if (!parsed) {
      this.errorMessage.set("Formato de placa o código no reconocido.");
      return;
    }

    this.handleSuccessfulScan(parsed);
  }

  onClose(): void {
    this.stopCamera();
    this.closed.emit();
  }

  @HostListener("window:keydown.escape")
  onEscape(): void {
    if (this.isOpen()) {
      this.onClose();
    }
  }
}
