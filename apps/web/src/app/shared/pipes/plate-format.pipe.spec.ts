import { PlateFormatPipe } from "./plate-format.pipe";

describe("PlateFormatPipe", () => {
  let pipe: PlateFormatPipe;

  beforeEach(() => {
    pipe = new PlateFormatPipe();
  });

  it("should create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  describe("Null, undefined, and empty inputs", () => {
    it("should return 'SIN PLACA' by default for null, undefined, or empty strings", () => {
      expect(pipe.transform(null)).toBe("SIN PLACA");
      expect(pipe.transform()).toBe("SIN PLACA");
      expect(pipe.transform("")).toBe("SIN PLACA");
      expect(pipe.transform("   ")).toBe("SIN PLACA");
    });
  });

  describe("Colombian plates", () => {
    it("should format standard 6-character car plate (AAA-000)", () => {
      expect(pipe.transform("abc123", "CO")).toBe("ABC-123");
      expect(pipe.transform("ABC123", "CO")).toBe("ABC-123");
      expect(pipe.transform("a-b-c 1 2 3", "CO")).toBe("ABC-123");
    });

    it("should format motorcycle plate (AAA-00A)", () => {
      expect(pipe.transform("abc12d", "CO")).toBe("ABC-12D");
      expect(pipe.transform("XYZ99W", "CO")).toBe("XYZ-99W");
    });

    it("should format partial Colombian plates", () => {
      expect(pipe.transform("a", "CO")).toBe("A");
      expect(pipe.transform("ab", "CO")).toBe("AB");
      expect(pipe.transform("abc", "CO")).toBe("ABC");
      expect(pipe.transform("abc1", "CO")).toBe("ABC-1");
    });

    it("should auto-detect Colombian plates when country is omitted or 'AUTO'", () => {
      expect(pipe.transform("abc123")).toBe("ABC-123");
      expect(pipe.transform("abc12d", "AUTO")).toBe("ABC-12D");
    });
  });

  describe("Venezuelan plates", () => {
    it("should format standard 7-character plate (AA-000-AA)", () => {
      expect(pipe.transform("ab123cd", "VE")).toBe("AB-123-CD");
      expect(pipe.transform("AB123CD", "VE")).toBe("AB-123-CD");
    });

    it("should format partial Venezuelan plates", () => {
      expect(pipe.transform("ab123", "VE")).toBe("AB-123");
      expect(pipe.transform("ab123c", "VE")).toBe("AB-123-C");
    });

    it("should auto-detect Venezuelan plates when country is omitted or 'AUTO'", () => {
      expect(pipe.transform("ab123cd")).toBe("AB-123-CD");
      expect(pipe.transform("ab123cd", "AUTO")).toBe("AB-123-CD");
      expect(pipe.transform("ab123")).toBe("AB-123");
    });
  });

  describe("Unplated vehicles", () => {
    it("should format unplated sequences with SP- prefix", () => {
      expect(pipe.transform("SP-1001")).toBe("SP-1001");
      expect(pipe.transform("sp1001")).toBe("SP-1001");
      expect(pipe.transform("1001", "UNPLATED")).toBe("SP-1001");
      expect(pipe.transform("SP 55", "UNPLATED")).toBe("SP-55");
    });

    it("should return fallback when plate is empty or sin placa with UNPLATED country", () => {
      expect(pipe.transform(null, "UNPLATED")).toBe("SIN PLACA");
      expect(pipe.transform("", "UNPLATED")).toBe("SIN PLACA");
      expect(pipe.transform("SIN PLACA", "UNPLATED")).toBe("SIN PLACA");
      expect(pipe.transform("sin-placa")).toBe("SIN PLACA");
    });
  });

  describe("Custom fallback option", () => {
    it("should use custom fallback string from options object", () => {
      expect(pipe.transform(null, { fallback: "N/A" })).toBe("N/A");
      expect(
        pipe.transform("", { country: "UNPLATED", fallback: "NO_PLATE" })
      ).toBe("NO_PLATE");
      expect(pipe.transform("SIN PLACA", { fallback: "SIN DATO" })).toBe(
        "SIN DATO"
      );
    });
  });

  describe("Parameter combinations", () => {
    it("should accept positional country parameter", () => {
      expect(pipe.transform("abc123", "CO")).toBe("ABC-123");
      expect(pipe.transform("ab123cd", "VE")).toBe("AB-123-CD");
    });

    it("should accept options object parameter", () => {
      expect(pipe.transform("abc123", { country: "CO" })).toBe("ABC-123");
      expect(pipe.transform("ab123cd", { country: "VE" })).toBe("AB-123-CD");
      expect(pipe.transform("1001", { country: "CO", isUnplated: true })).toBe(
        "SP-1001"
      );
    });

    it("should accept isUnplated as third boolean parameter", () => {
      expect(pipe.transform("1001", "CO", true)).toBe("SP-1001");
      expect(pipe.transform("abc123", "CO", false)).toBe("ABC-123");
    });
  });
});
