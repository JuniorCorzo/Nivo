import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";
import { setTimeout as sleep } from "node:timers/promises";

import { PhotoCaptureComponent } from "./photo-capture.component";

interface MockStream {
  getTracks: ReturnType<typeof vi.fn>;
}

describe("PhotoCaptureComponent", () => {
  let component: PhotoCaptureComponent;
  let fixture: ComponentFixture<PhotoCaptureComponent>;

  // ~30 KB
  const mockBase64 = `data:image/jpeg;base64,${"A".repeat(40_000)}`;
  let mockTracks: { kind: string; stop: ReturnType<typeof vi.fn> }[];
  let mockStream: MockStream;

  beforeEach(async () => {
    mockTracks = [{ kind: "video", stop: vi.fn() }];
    mockStream = {
      getTracks: vi.fn().mockReturnValue(mockTracks),
    };

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
    });

    const mockCtx: Partial<CanvasRenderingContext2D> = {
      drawImage: vi.fn(),
    };
    /* SAFETY: Partial canvas context satisfies drawImage in test environment */
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      mockCtx as CanvasRenderingContext2D,
    );

    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(mockBase64);

    await TestBed.configureTestingModule({
      imports: [PhotoCaptureComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("1. debe inicializar en estado inactivo sin foto", () => {
    expect(component).toBeTruthy();
    expect(component.isCameraActive()).toBe(false);
    expect(component.photoDataUrl()).toBeNull();
    expect(component.photoSizeKb()).toBe(0);
    expect(component.errorMessage()).toBeNull();
  });

  it("2. debe iniciar cámara y capturar foto desde canvas emitiendo photoCaptured con base64", async () => {
    const emitSpy = vi.spyOn(component.photoCaptured, "emit");

    await component.startCamera();
    expect(component.isCameraActive()).toBe(true);
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: {
        facingMode: "environment",
        height: { ideal: 360 },
        width: { ideal: 640 },
      },
    });

    component.capturePhoto();

    expect(emitSpy).toHaveBeenCalledWith(mockBase64);
    expect(component.photoDataUrl()).toBe(mockBase64);
    expect(component.isCameraActive()).toBe(false);
    expect(mockTracks[0]?.stop).toHaveBeenCalled();
  });

  it("3. debe verificar compresión (< 100 KB) y cálculo de photoSizeKb", () => {
    const sizeKb = component.calculateSizeKb(mockBase64);
    expect(sizeKb).toBeGreaterThan(0);
    expect(sizeKb).toBeLessThan(100);

    component.setPhoto(mockBase64);
    expect(component.photoSizeKb()).toBe(sizeKb);
    expect(component.photoSizeKb()).toBeLessThan(100);
  });

  it("4. debe limpiar la foto y emitir photoCleared", () => {
    component.setPhoto(mockBase64);
    expect(component.photoDataUrl()).toBe(mockBase64);

    const clearedSpy = vi.spyOn(component.photoCleared, "emit");
    component.clearPhoto();

    expect(component.photoDataUrl()).toBeNull();
    expect(component.photoSizeKb()).toBe(0);
    expect(clearedSpy).toHaveBeenCalled();
  });

  it("5. debe manejar fallback por carga de archivo (input file)", async () => {
    const emitSpy = vi.spyOn(component.photoCaptured, "emit");
    const file = new File(["dummy content"], "photo.jpg", {
      type: "image/jpeg",
    });

    class MockFileReader {
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((e: ProgressEvent<FileReader>) => void) | null = null;
      private listeners: Record<string, ((e: ProgressEvent<FileReader>) => void)[]> = {};

      addEventListener(event: string, listener: (e: ProgressEvent<FileReader>) => void) {
        (this.listeners[event] ??= []).push(listener);
      }

      readAsDataURL() {
        setTimeout(() => {
          const mockResult: Partial<FileReader> = { result: mockBase64 };
          /* SAFETY: Mock ProgressEvent for file reader */
          const event = {
            target: mockResult as FileReader,
          } as ProgressEvent<FileReader>;
          this.onload?.(event);
          for (const listener of this.listeners["load"] ?? []) {
            listener(event);
          }
        }, 10);
      }
    }
    vi.stubGlobal("FileReader", MockFileReader);

    const MockImage = vi.fn().mockImplementation(() => {
      const listeners: Record<string, (() => void)[]> = {};
      let currentSrc = "";
      return {
        addEventListener(event: string, listener: () => void) {
          (listeners[event] ??= []).push(listener);
        },
        height: 600,
        onload: null,
        get src(): string {
          return currentSrc;
        },
        set src(val: string) {
          currentSrc = val;
          setTimeout(() => {
            this.onload?.();
            for (const listener of listeners["load"] ?? []) {
              listener();
            }
          }, 10);
        },
        width: 800,
      };
    });
    vi.stubGlobal("Image", MockImage);

    const input = document.createElement("input");
    input.type = "file";
    Object.defineProperty(input, "files", {
      value: [file],
    });

    const event = new Event("change");
    Object.defineProperty(event, "target", { value: input });
    component.onFileSelected(event);

    await sleep(50);

    expect(emitSpy).toHaveBeenCalledWith(mockBase64);
    expect(component.photoDataUrl()).toBe(mockBase64);
  });

  it("6. debe manejar error al acceder a la cámara y asignar mensaje", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockRejectedValue(new Error("Permission denied")),
      },
      writable: true,
    });

    await component.startCamera();

    expect(component.isCameraActive()).toBe(false);
    expect(component.errorMessage()).toBe(APP_TEXTS.photoCapture.cameraError);
  });
});
