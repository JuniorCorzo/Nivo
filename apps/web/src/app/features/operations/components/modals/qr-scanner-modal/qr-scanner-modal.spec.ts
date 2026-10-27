import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { QrScannerModalComponent, parseScannedData } from "./qr-scanner-modal";

interface MockMediaStream {
  getTracks: () => { kind: string; stop: () => void }[];
}

describe("QrScannerModalComponent & parseScannedData", () => {
  describe("parseScannedData", () => {
    it("should parse raw license plates correctly", () => {
      expect(parseScannedData("ABC123")).toEqual({ plate: "ABC123" });
      expect(parseScannedData("abc-123")).toEqual({ plate: "ABC123" });
      expect(parseScannedData(" XYZ 456 ")).toEqual({ plate: "XYZ456" });
    });

    it("should parse JSON payload with plate and vehicle type", () => {
      const jsonCar = JSON.stringify({ plate: "ABC123", type: "CAR" });
      expect(parseScannedData(jsonCar)).toEqual({
        plate: "ABC123",
        vehicleType: "CAR",
      });

      const jsonMoto = JSON.stringify({
        licensePlate: "MOT-99",
        vehicleType: "MOTORCYCLE",
      });
      expect(parseScannedData(jsonMoto)).toEqual({
        plate: "MOT99",
        vehicleType: "MOTORCYCLE",
      });
    });

    it("should parse URL with query parameters", () => {
      const url = "https://nivo.app/tickets/T123?plate=ABC123&type=CAR";
      expect(parseScannedData(url)).toEqual({
        plate: "ABC123",
        vehicleType: "CAR",
      });

      const relativeUrl = "/checkin?plate=MTO456&vehicleType=MOTORCYCLE";
      expect(parseScannedData(relativeUrl)).toEqual({
        plate: "MTO456",
        vehicleType: "MOTORCYCLE",
      });
    });

    it("should extract plate from URL path when query params are absent", () => {
      const url = "https://nivo.app/tickets/ABC123";
      expect(parseScannedData(url)).toEqual({
        plate: "ABC123",
      });
    });

    it("should return null for invalid or empty inputs", () => {
      expect(parseScannedData("")).toBeNull();
      expect(parseScannedData("   ")).toBeNull();
      expect(parseScannedData("A")).toBeNull();
      expect(parseScannedData("TOOLONGLICENSEPLATENAME123")).toBeNull();
    });
  });

  describe("QrScannerModalComponent lifecycle & scanning", () => {
    let component: QrScannerModalComponent;
    let fixture: ComponentFixture<QrScannerModalComponent>;
    let mockTracks: { kind: string; stop: ReturnType<typeof vi.fn> }[];
    let mockStream: MockMediaStream;

    beforeEach(async () => {
      mockTracks = [{ kind: "video", stop: vi.fn() }];
      mockStream = {
        getTracks: vi.fn().mockImplementation(() => [mockTracks[0]]),
      };

      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: {
          getUserMedia: vi.fn().mockResolvedValue(mockStream),
        },
        writable: true,
      });

      await TestBed.configureTestingModule({
        imports: [QrScannerModalComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(QrScannerModalComponent);
      component = fixture.componentInstance;
    });

    afterEach(() => {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    });

    it("should initialize in closed state without active camera", () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
      expect(component.isCameraActive()).toBe(false);
      expect(component.errorMessage()).toBeNull();
    });

    it("should start camera when isOpen is set to true", async () => {
      fixture.componentRef.setInput("isOpen", true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isCameraActive()).toBe(true);
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: "environment" },
      });
    });

    it("should stop camera and tracks when modal closes or destroys", async () => {
      fixture.componentRef.setInput("isOpen", true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isCameraActive()).toBe(true);

      component.onClose();
      expect(component.isCameraActive()).toBe(false);
      expect(mockTracks[0]?.stop).toHaveBeenCalled();
    });

    it("should handle camera access error gracefully", async () => {
      vi.spyOn(navigator.mediaDevices, "getUserMedia").mockRejectedValue(
        new Error("Permission denied")
      );

      await component.startCamera();

      expect(component.isCameraActive()).toBe(false);
      expect(component.errorMessage()).toContain(
        "No se pudo acceder a la cámara"
      );
    });

    it("should emit scanned data and closed on valid manual input", () => {
      const scannedSpy = vi.spyOn(component.scanned, "emit");
      const closedSpy = vi.spyOn(component.closed, "emit");

      component.manualInputValue.set("ABC-123");
      component.onManualInputSubmit();

      expect(scannedSpy).toHaveBeenCalledWith({ plate: "ABC123" });
      expect(closedSpy).toHaveBeenCalled();
    });

    it("should show error on invalid manual input without emitting scanned", () => {
      const scannedSpy = vi.spyOn(component.scanned, "emit");

      component.manualInputValue.set("???");
      component.onManualInputSubmit();

      expect(scannedSpy).not.toHaveBeenCalled();
      expect(component.errorMessage()).toContain("no reconocido");
    });

    it("should emit scanned on valid barcode detector detection", () => {
      const scannedSpy = vi.spyOn(component.scanned, "emit");
      const closedSpy = vi.spyOn(component.closed, "emit");

      component.handleSuccessfulScan({
        plate: "XYZ789",
        vehicleType: "MOTORCYCLE",
      });

      expect(scannedSpy).toHaveBeenCalledWith({
        plate: "XYZ789",
        vehicleType: "MOTORCYCLE",
      });
      expect(closedSpy).toHaveBeenCalled();
    });
  });
});
