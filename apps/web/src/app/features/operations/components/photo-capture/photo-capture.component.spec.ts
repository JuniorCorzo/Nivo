import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { APP_TEXTS } from "@shared/constants/app-texts.constant";

import { PhotoCaptureComponent } from "./photo-capture.component";

describe("PhotoCaptureComponent", () => {
  let component: PhotoCaptureComponent;
  let fixture: ComponentFixture<PhotoCaptureComponent>;

  const mockBase64 = "data:image/jpeg;base64," + "A".repeat(40000); // ~30 KB
  let mockTracks: { stop: ReturnType<typeof vi.fn>; kind: string }[];
  let mockStream: MediaStream;

  beforeEach(async () => {
    mockTracks = [{ kind: "video", stop: vi.fn() }];
    mockStream = {
      getTracks: vi.fn().mockReturnValue(mockTracks),
    } as unknown as MediaStream;

    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getUserMedia: vi.fn().mockResolvedValue(mockStream),
      },
      writable: true,
    });

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      drawImage: vi.fn(),
    } as unknown as CanvasRenderingContext2D);

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
    const file = new File(["dummy content"], "photo.jpg", { type: "image/jpeg" });

    const originalFileReader = globalThis.FileReader;
    class MockFileReader {
      onload: ((e: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((e: ProgressEvent<FileReader>) => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          this.onload?.({
            target: { result: mockBase64 },
          } as unknown as ProgressEvent<FileReader>);
        }, 10);
      }
    }
    // SAFETY: Mocking FileReader for testing
    globalThis.FileReader = MockFileReader as unknown as typeof FileReader;

    const originalImage = globalThis.Image;
    class MockImage {
      width = 800;
      height = 600;
      onload: (() => void) | null = null;
      set src(_val: string) {
        setTimeout(() => {
          this.onload?.();
        }, 10);
      }
    }
    // SAFETY: Mocking Image for testing
    globalThis.Image = MockImage as unknown as typeof Image;

    const input = document.createElement("input");
    input.type = "file";
    Object.defineProperty(input, "files", {
      value: [file],
    });

    const event = { target: input } as unknown as Event;
    component.onFileSelected(event);

    await new Promise((r) => setTimeout(r, 50));

    expect(emitSpy).toHaveBeenCalledWith(mockBase64);
    expect(component.photoDataUrl()).toBe(mockBase64);

    globalThis.FileReader = originalFileReader;
    globalThis.Image = originalImage;
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
