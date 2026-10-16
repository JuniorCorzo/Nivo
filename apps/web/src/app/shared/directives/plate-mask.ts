import {
  Directive,
  ElementRef,
  HostListener,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import type { VehicleType } from "@core/models/rate.model";
import type { PlateCountry } from "@core/models/ticket.model";

@Directive({
  selector: "input[appPlateMask]",
  standalone: true,
})
export class PlateMaskDirective {
  private readonly elementRef =
    inject<ElementRef<HTMLInputElement>>(ElementRef);

  /** Target registration country: 'CO' | 'VE' | 'UNPLATED' */
  readonly country = input<PlateCountry>("CO");

  /** Vehicle type for specialized sub-masks (e.g. Colombian motorcycles): 'CAR' | 'MOTORCYCLE' | 'BIKE' */
  readonly vehicleType = input<VehicleType>("CAR");

  /** Optional output emitting raw alphanumeric string (e.g., 'ABC123') */
  readonly rawPlateChange = output<string>();

  private isDeletingDelimiter = false;
  private lastRawValue = "";

  constructor() {
    effect(() => {
      // Re-apply mask whenever country or vehicleType input signal changes
      this.country();
      this.vehicleType();
      this.reformatCurrentValue();
    });
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent): void {
    if (this.country() === "UNPLATED") {
      return;
    }

    const inputEl = this.elementRef.nativeElement;
    const { selectionStart, selectionEnd, value } = inputEl;

    // Detect backspace immediately following a hyphen separator
    if (
      event.key === "Backspace" &&
      selectionStart !== null &&
      selectionStart === selectionEnd &&
      selectionStart > 0 &&
      value[selectionStart - 1] === "-"
    ) {
      this.isDeletingDelimiter = true;
    }
  }

  @HostListener("input", ["$event"])
  onInput(event: Event): void {
    if (this.country() === "UNPLATED") {
      return;
    }

    this.applyMask(event);
  }

  private reformatCurrentValue(): void {
    const inputEl = this.elementRef.nativeElement;
    if (!inputEl || this.country() === "UNPLATED" || !inputEl.value) {
      return;
    }
    this.applyMask();
  }

  private applyMask(triggerEvent?: Event): void {
    const inputEl = this.elementRef.nativeElement;
    const originalValue = inputEl.value;
    const caretPos = inputEl.selectionStart ?? originalValue.length;

    // 1. Calculate how many raw alphanumeric characters precede the cursor
    const textBeforeCursor = originalValue.slice(0, caretPos);
    let rawCharsBeforeCursor = textBeforeCursor.replaceAll(
      /[^A-Za-z0-9]/gu,
      ""
    ).length;

    // 2. Extract sanitized alphanumeric content, keeping full buffer if switching country
    let raw = originalValue.replaceAll(/[^A-Za-z0-9]/gu, "").toUpperCase();
    if (
      this.lastRawValue &&
      this.lastRawValue.startsWith(raw) &&
      this.lastRawValue.length > raw.length
    ) {
      raw = this.lastRawValue;
    }

    // If backspacing on a delimiter, adjust raw character and caret tracking
    if (this.isDeletingDelimiter) {
      this.isDeletingDelimiter = false;
      if (raw.length === this.lastRawValue.length && rawCharsBeforeCursor > 0) {
        // Native browser backspace only deleted '-', delete preceding character as well
        raw =
          raw.slice(0, rawCharsBeforeCursor - 1) +
          raw.slice(rawCharsBeforeCursor);
      }
      if (rawCharsBeforeCursor > 0) {
        rawCharsBeforeCursor -= 1;
      }
    }

    this.lastRawValue = raw;

    // 3. Format according to country and vehicle type
    const formatted = PlateMaskDirective.formatPlate(
      raw,
      this.country(),
      this.vehicleType()
    );
    const rawPlate = formatted.replaceAll(/[^A-Za-z0-9]/gu, "");

    // 4. Update DOM value if changed
    if (inputEl.value !== formatted) {
      inputEl.value = formatted;
      this.rawPlateChange.emit(rawPlate);

      // Trigger synthetic input event only if not currently handling an input event
      if (!triggerEvent) {
        inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }

    // 5. Calculate new caret position matching rawCharsBeforeCursor
    let newCaretPos = 0;
    let countedRaw = 0;
    for (let i = 0; i < formatted.length; i += 1) {
      if (countedRaw === rawCharsBeforeCursor) {
        newCaretPos = i;
        break;
      }
      if (/[A-Za-z0-9]/u.test(formatted[i])) {
        countedRaw += 1;
      }
      newCaretPos = i + 1;
    }

    inputEl.setSelectionRange(newCaretPos, newCaretPos);
  }

  private static formatPlate(
    raw: string,
    country: PlateCountry,
    vehicleType: VehicleType
  ): string {
    if (country === "CO") {
      return PlateMaskDirective.formatColombian(raw, vehicleType);
    }
    if (country === "VE") {
      return PlateMaskDirective.formatVenezuelan(raw);
    }
    return raw;
  }

  private static formatColombian(
    raw: string,
    _vehicleType: VehicleType
  ): string {
    // Max 6 alphanumeric characters: AAA-000 (Car) or AAA-00A (Motorcycle)
    const truncated = raw.slice(0, 6);
    if (truncated.length <= 3) {
      return truncated;
    }
    // If letters (2 or 3) followed only by digits, split cleanly at the delimiter
    const letterDigitMatch = truncated.match(
      /^(?<letters>[A-Z]{2,3})(?<digits>\d+)$/u
    );
    if (letterDigitMatch?.groups) {
      return `${letterDigitMatch.groups["letters"]}-${letterDigitMatch.groups["digits"]}`;
    }
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  }

  private static formatVenezuelan(raw: string): string {
    // Max 7 alphanumeric characters: AA-000-AA
    const truncated = raw.slice(0, 7);
    if (truncated.length <= 2) {
      return truncated;
    }
    if (truncated.length <= 5) {
      return `${truncated.slice(0, 2)}-${truncated.slice(2)}`;
    }
    return `${truncated.slice(0, 2)}-${truncated.slice(2, 5)}-${truncated.slice(5)}`;
  }
}
