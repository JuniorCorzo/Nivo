import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { VehicleType } from "@core/models/rate.model";
import type { PlateCountry } from "@core/models/ticket.model";

import { PlateMaskDirective } from "./plate-mask";

@Component({
  imports: [PlateMaskDirective],
  standalone: true,
  template: `
    <input
      #inputRef
      id="test-plate"
      appPlateMask
      [country]="country()"
      [vehicleType]="vehicleType()"
    />
  `,
})
class TestHostComponent {
  readonly country = signal<PlateCountry>("CO");
  readonly vehicleType = signal<VehicleType>("CAR");
}

describe("PlateMaskDirective", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let inputEl: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, PlateMaskDirective],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    inputEl = fixture.nativeElement.querySelector("#test-plate");
  });

  const setInputValue = (value: string, caretPos?: number): void => {
    inputEl.focus();
    inputEl.value = value;
    const pos = caretPos ?? value.length;
    inputEl.setSelectionRange(pos, pos);
    inputEl.dispatchEvent(new Event("input", { bubbles: true }));
  };

  it("should create input element with directive attached", () => {
    expect(inputEl).toBeTruthy();
  });

  describe("Colombian Automobile (CO + CAR: AAA-000)", () => {
    beforeEach(() => {
      host.country.set("CO");
      host.vehicleType.set("CAR");
      fixture.detectChanges();
    });

    it("should format lowercase alphanumeric string into AAA-000", () => {
      setInputValue("abc123");
      expect(inputEl.value).toBe("ABC-123");
    });

    it("should sanitize spaces, dots and symbols", () => {
      setInputValue("a.b-c 1@2#3");
      expect(inputEl.value).toBe("ABC-123");
    });

    it("should format progressively as operator types", () => {
      setInputValue("a");
      expect(inputEl.value).toBe("A");

      setInputValue("ab");
      expect(inputEl.value).toBe("AB");

      setInputValue("abc");
      expect(inputEl.value).toBe("ABC");

      setInputValue("abc1");
      expect(inputEl.value).toBe("ABC-1");

      setInputValue("abc12");
      expect(inputEl.value).toBe("ABC-12");

      setInputValue("abc123");
      expect(inputEl.value).toBe("ABC-123");
    });

    it("should truncate characters exceeding 6 alphanumeric characters", () => {
      setInputValue("abc12345");
      expect(inputEl.value).toBe("ABC-123");
    });

    it("should strictly truncate to 6 alphanumeric characters when typing 7 or more characters", () => {
      setInputValue("ABC123XYZ");
      expect(inputEl.value).toBe("ABC-123");
    });
  });

  describe("Colombian Motorcycle (CO + MOTORCYCLE: AAA-00A)", () => {
    beforeEach(() => {
      host.country.set("CO");
      host.vehicleType.set("MOTORCYCLE");
      fixture.detectChanges();
    });

    it("should format motorcycle plate with ending letter", () => {
      setInputValue("abc12d");
      expect(inputEl.value).toBe("ABC-12D");
    });

    it("should format motorcycle progressively", () => {
      setInputValue("abc1");
      expect(inputEl.value).toBe("ABC-1");

      setInputValue("abc12");
      expect(inputEl.value).toBe("ABC-12");

      setInputValue("abc12d");
      expect(inputEl.value).toBe("ABC-12D");
    });
  });

  describe("Venezuelan Vehicle (VE: AA-000-AA)", () => {
    beforeEach(() => {
      host.country.set("VE");
      host.vehicleType.set("CAR");
      fixture.detectChanges();
    });

    it("should format Venezuelan 7-character plate to AA-000-AA", () => {
      setInputValue("ab123cd");
      expect(inputEl.value).toBe("AB-123-CD");
    });

    it("should format Venezuelan plate progressively", () => {
      setInputValue("a");
      expect(inputEl.value).toBe("A");

      setInputValue("ab");
      expect(inputEl.value).toBe("AB");

      setInputValue("ab1");
      expect(inputEl.value).toBe("AB-1");

      setInputValue("ab123");
      expect(inputEl.value).toBe("AB-123");

      setInputValue("ab123c");
      expect(inputEl.value).toBe("AB-123-C");

      setInputValue("ab123cd");
      expect(inputEl.value).toBe("AB-123-CD");
    });

    it("should truncate Venezuelan plate exceeding 7 alphanumeric characters", () => {
      setInputValue("ab123cd99");
      expect(inputEl.value).toBe("AB-123-CD");
    });
  });

  describe("Unplated Mode (UNPLATED)", () => {
    beforeEach(() => {
      host.country.set("UNPLATED");
      fixture.detectChanges();
    });

    it("should leave raw input unaltered when country is UNPLATED", () => {
      setInputValue("moto-sin-placa-123");
      expect(inputEl.value).toBe("moto-sin-placa-123");
    });
  });

  describe("Caret Positioning & Delimiter Handling", () => {
    beforeEach(() => {
      host.country.set("CO");
      host.vehicleType.set("CAR");
      fixture.detectChanges();
    });

    it("should preserve caret position when inserting character before hyphen", () => {
      // cursor between A and C
      setInputValue("AC-123", 1);
      // simulate inserting B
      inputEl.value = "ABC-123";
      inputEl.setSelectionRange(2, 2);
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));

      expect(inputEl.value).toBe("ABC-123");
      expect(inputEl.selectionStart).toBe(2);
      expect(inputEl.selectionEnd).toBe(2);
    });

    it("should preserve caret after hyphen insertion", () => {
      setInputValue("ABC1", 4);
      expect(inputEl.value).toBe("ABC-1");
      expect(inputEl.selectionStart).toBe(5);
    });

    it("should handle backspace across hyphen without getting trapped", () => {
      setInputValue("ABC-123");
      // Place cursor right after the hyphen: position 4 (index after 'ABC-')
      inputEl.setSelectionRange(4, 4);

      // Trigger keydown for Backspace
      const keyEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Backspace",
      });
      inputEl.dispatchEvent(keyEvent);

      // Delimiter backspace should remove 'C' resulting in 'AB'
      setInputValue("AB123", 2);
      expect(inputEl.value).toBe("AB-123");
    });

    it("should smoothly support backspacing character by character without reverting", () => {
      setInputValue("ABC123");
      expect(inputEl.value).toBe("ABC-123");

      // Backspacing '3'
      setInputValue("ABC-12");
      expect(inputEl.value).toBe("ABC-12");

      // Backspacing '2'
      setInputValue("ABC-1");
      expect(inputEl.value).toBe("ABC-1");

      // Backspacing '1'
      setInputValue("ABC-");
      expect(inputEl.value).toBe("ABC");

      // Backspacing 'C'
      setInputValue("AB");
      expect(inputEl.value).toBe("AB");

      // Backspacing 'B'
      setInputValue("A");
      expect(inputEl.value).toBe("A");

      // Backspacing 'A'
      setInputValue("");
      expect(inputEl.value).toBe("");
    });
  });

  describe("Dynamic Signal Changes", () => {
    it("should re-format plate when country changes from CO to VE", () => {
      host.country.set("CO");
      host.vehicleType.set("CAR");
      fixture.detectChanges();

      setInputValue("AB123C");
      // In CO car, 6 chars max -> formatted AB1-23C
      expect(inputEl.value).toBe("AB1-23C");

      // Switch to VE
      host.country.set("VE");
      fixture.detectChanges();

      // Trigger directive refresh
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      expect(inputEl.value).toBe("AB-123-C");

      // Now with VE active, typing 7th character formats to AA-000-AA
      setInputValue("AB123CD");
      expect(inputEl.value).toBe("AB-123-CD");
    });
  });
});
