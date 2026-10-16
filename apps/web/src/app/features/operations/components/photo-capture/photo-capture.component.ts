import { CommonModule } from "@angular/common";
import type { ElementRef, OnDestroy } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  input,
  output,
  signal,
} from "@angular/core";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideCamera,
  lucideCheck,
  lucideRefreshCw,
  lucideTrash2,
  lucideUpload,
} from "@ng-icons/lucide";
import { BadgeComponent, ButtonComponent } from "@nivo-sass/design-system";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BadgeComponent, ButtonComponent, CommonModule, NgIcon],
  providers: [
    provideIcons({
      lucideCamera,
      lucideCheck,
      lucideRefreshCw,
      lucideTrash2,
      lucideUpload,
    }),
  ],
  selector: "app-photo-capture",
  standalone: true,
  template: `
    <div class="flex w-full flex-col gap-3">
      @if (isCameraActive()) {
        <!-- Vista en vivo de cámara WebRTC -->
        <div
          class="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-black"
        >
          <video
            #videoElement
            autoplay
            playsinline
            muted
            class="h-full w-full object-cover"
          ></video>
        </div>

        <div class="flex items-center gap-2">
          <nv-button
            type="button"
            variant="default"
            size="sm"
            (click)="capturePhoto()"
            class="flex-1"
          >
            <ng-icon name="lucideCamera" class="text-sm" />
            <span>{{ texts.capture }}</span>
          </nv-button>
          <nv-button
            type="button"
            variant="outline"
            size="sm"
            (click)="stopCamera()"
          >
            <span>{{ texts.stopCamera }}</span>
          </nv-button>
        </div>
      } @else if (photoDataUrl()) {
        <!-- Vista previa de foto capturada / subida -->
        <div
          class="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
        >
          <img
            [src]="photoDataUrl()"
            alt="Preview motocicleta"
            class="h-full w-full object-contain"
          />
          <div class="absolute top-2 right-2">
            <nv-badge
              variant="outline"
              class="border-zinc-700 bg-zinc-900/90 font-mono text-xs backdrop-blur-xs"
            >
              <ng-icon
                name="lucideCheck"
                class="mr-1 text-xs text-emerald-400"
              />
              <span>{{ texts.badgeSize(photoSizeKb()) }}</span>
            </nv-badge>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <nv-button
            type="button"
            variant="outline"
            size="sm"
            (click)="startCamera()"
            [disabled]="disabled()"
          >
            <ng-icon name="lucideRefreshCw" class="text-sm" />
            <span>{{ texts.retake }}</span>
          </nv-button>
          <nv-button
            type="button"
            variant="destructive"
            size="sm"
            (click)="clearPhoto()"
            [disabled]="disabled()"
          >
            <ng-icon name="lucideTrash2" class="text-sm" />
            <span>{{ texts.clearPhoto }}</span>
          </nv-button>
        </div>
      } @else {
        <!-- Estado inactivo / placeholder -->
        <div
          class="flex flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-zinc-800 bg-zinc-900/40 p-6 text-center"
        >
          <div
            class="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-800 text-zinc-400"
          >
            <ng-icon name="lucideCamera" class="text-xl" />
          </div>
          <div class="flex flex-col gap-0.5">
            <span class="text-xs font-semibold text-zinc-200">{{
              texts.noPhoto
            }}</span>
            <span class="text-[11px] text-zinc-400">{{ texts.hint }}</span>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-2 pt-1">
            <nv-button
              type="button"
              variant="outline"
              size="sm"
              (click)="startCamera()"
              [disabled]="disabled()"
            >
              <ng-icon name="lucideCamera" class="text-sm" />
              <span>{{ texts.startCamera }}</span>
            </nv-button>
            <nv-button
              type="button"
              variant="outline"
              size="sm"
              (click)="fileInput.click()"
              [disabled]="disabled()"
            >
              <ng-icon name="lucideUpload" class="text-sm" />
              <span>{{ texts.uploadFallback }}</span>
            </nv-button>
            <input
              #fileInput
              type="file"
              accept="image/*"
              class="hidden"
              (change)="onFileSelected($event)"
            />
          </div>
        </div>
      }

      @if (errorMessage()) {
        <div
          class="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-400"
        >
          <span>{{ errorMessage() }}</span>
        </div>
      }
    </div>
  `,
})
export class PhotoCaptureComponent implements OnDestroy {
  readonly texts = APP_TEXTS.photoCapture;

  readonly disabled = input<boolean>(false);
  readonly initialPhoto = input<string | null>(null);

  readonly photoCaptured = output<string>();
  readonly photoCleared = output<void>();

  readonly photoDataUrl = signal<string | null>(null);
  readonly photoSizeKb = signal<number>(0);
  readonly isCameraActive = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  @ViewChild("videoElement") videoRef?: ElementRef<HTMLVideoElement>;

  private mediaStream: MediaStream | null = null;
  private readonly MAX_WIDTH = 640;
  private readonly MAX_HEIGHT = 360;
  private readonly QUALITY = 0.7;

  constructor() {
    const init = this.initialPhoto();
    if (init) {
      this.setPhoto(init);
    }
  }

  ngOnDestroy(): void {
    this.stopCamera();
  }

  async startCamera(): Promise<void> {
    this.errorMessage.set(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          height: { ideal: this.MAX_HEIGHT },
          width: { ideal: this.MAX_WIDTH },
        },
      });
      this.mediaStream = stream;
      this.isCameraActive.set(true);

      setTimeout(() => {
        if (this.videoRef?.nativeElement) {
          this.videoRef.nativeElement.srcObject = stream;
        }
      }, 0);
    } catch {
      this.errorMessage.set(this.texts.cameraError);
      this.isCameraActive.set(false);
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      for (const track of this.mediaStream.getTracks()) {
        track.stop();
      }
      this.mediaStream = null;
    }
    this.isCameraActive.set(false);
  }

  capturePhoto(): void {
    const video = this.videoRef?.nativeElement;
    const sourceWidth = video?.videoWidth || this.MAX_WIDTH;
    const sourceHeight = video?.videoHeight || this.MAX_HEIGHT;

    const { targetHeight, targetWidth } = this.calculateDimensions(
      sourceWidth,
      sourceHeight
    );

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (ctx && video) {
      ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
      const dataUrl = canvas.toDataURL("image/jpeg", this.QUALITY);
      this.setPhoto(dataUrl);
    } else {
      const dataUrl = canvas.toDataURL("image/jpeg", this.QUALITY);
      this.setPhoto(dataUrl);
    }

    this.stopCamera();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      this.errorMessage.set(this.texts.invalidType);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!rawDataUrl) {
        return;
      }

      const img = new Image();
      img.onload = () => {
        const { targetHeight, targetWidth } = this.calculateDimensions(
          img.width,
          img.height
        );
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const compressed = canvas.toDataURL("image/jpeg", this.QUALITY);
          this.setPhoto(compressed);
        }
        input.value = "";
      };
      img.onerror = () => {
        this.errorMessage.set(this.texts.loadError);
        input.value = "";
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      this.errorMessage.set(this.texts.loadError);
      input.value = "";
    };
    reader.readAsDataURL(file);
  }

  setPhoto(dataUrl: string): void {
    this.photoDataUrl.set(dataUrl);
    const sizeKb = this.calculateSizeKb(dataUrl);
    this.photoSizeKb.set(sizeKb);
    this.errorMessage.set(null);
    this.photoCaptured.emit(dataUrl);
  }

  clearPhoto(): void {
    this.photoDataUrl.set(null);
    this.photoSizeKb.set(0);
    this.errorMessage.set(null);
    this.photoCleared.emit();
  }

  calculateSizeKb(dataUrl: string): number {
    const base64Data = dataUrl.includes(",")
      ? (dataUrl.split(",")[1] ?? "")
      : dataUrl;
    const bytes = (base64Data.length * 3) / 4;
    return Math.round((bytes / 1024) * 10) / 10;
  }

  private calculateDimensions(
    sourceWidth: number,
    sourceHeight: number
  ): { targetHeight: number; targetWidth: number } {
    let targetWidth = sourceWidth;
    let targetHeight = sourceHeight;

    if (targetWidth > this.MAX_WIDTH || targetHeight > this.MAX_HEIGHT) {
      const ratio = Math.min(
        this.MAX_WIDTH / targetWidth,
        this.MAX_HEIGHT / targetHeight
      );
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    }

    return { targetHeight, targetWidth };
  }
}
