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
import type {
  PlateCountryMode,
  PlateStateSpec,
} from "@shared/utils/plate.utils";
import {
  PLATE_STATE_MACHINE,
  normalizeRawPlate,
  resolvePlatedCountry,
} from "@shared/utils/plate.utils";

interface DelimiterBackspaceResult {
  readonly updatedCaretCount: number;
  readonly updatedRaw: string;
}

interface RawPlateState {
  readonly spec: PlateStateSpec;
  readonly raw: string;
  readonly rawCharsBeforeCursor: number;
}

@Directive({
  selector: "input[appPlateMask]",
  standalone: true,
})
export class PlateMaskDirective {
  private readonly elementRef =
    inject<ElementRef<HTMLInputElement>>(ElementRef);

  /** Target registration country: 'CO' | 'VE' | 'UNPLATED' | 'AUTO' */
  readonly country = input<PlateCountryMode>("AUTO");

  /** Vehicle type for specialized sub-masks (e.g. Colombian motorcycles): 'CAR' | 'MOTORCYCLE' | 'BIKE' */
  readonly vehicleType = input<VehicleType>("CAR");

  /** Optional output emitting raw alphanumeric string (e.g., 'ABC123') */
  readonly rawPlateChange = output<string>();

  /** Output emitting detected or effective plate country */
  readonly countryChange = output<PlateCountry>();

  private isDeletingDelimiter = false;
  private lastRawValue = "";
  private lastEmittedCountry: PlateCountry | null = null;

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
      return;
    }

    // Brake typing when maximum raw plate length is reached
    this.handleKeydownBraking(event, inputEl);
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
    if (!inputEl || this.country() === "UNPLATED") {
      return;
    }

    const state = this.prepareRawPlate(inputEl);
    const formatted = state.spec.format(state.raw);
    const rawPlate = normalizeRawPlate(formatted);

    this.updateDomValue(inputEl, formatted, rawPlate, state.spec, triggerEvent);
    this.updateCaretPosition(inputEl, formatted, state.rawCharsBeforeCursor);
    this.emitCountryChange(state.spec.country, triggerEvent);
  }

  private prepareRawPlate(inputEl: HTMLInputElement): RawPlateState {
    const originalValue = inputEl.value;
    const caretPos = inputEl.selectionStart ?? originalValue.length;
    const textBeforeCursor = originalValue.slice(0, caretPos);
    let rawCharsBeforeCursor = normalizeRawPlate(textBeforeCursor).length;

    let raw = normalizeRawPlate(originalValue);
    const spec = this.resolvePlateState(raw);
    raw = raw.slice(0, spec.maxRawLength);

    const backspaceResult = this.handleDelimiterBackspace(
      raw,
      rawCharsBeforeCursor
    );
    raw = backspaceResult.updatedRaw;
    rawCharsBeforeCursor = backspaceResult.updatedCaretCount;
    this.lastRawValue = raw;
    const finalSpec = this.resolvePlateState(raw);

    return { raw, rawCharsBeforeCursor, spec: finalSpec };
  }

  private handleKeydownBraking(
    event: KeyboardEvent,
    inputEl: HTMLInputElement
  ): void {
    if (
      event.key.length !== 1 ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    ) {
      return;
    }
    const { selectionStart, selectionEnd, value } = inputEl;
    const hasSelection =
      selectionStart !== null &&
      selectionEnd !== null &&
      selectionStart !== selectionEnd;
    if (hasSelection) {
      return;
    }

    const raw = normalizeRawPlate(value);
    const { maxRawLength } = this.resolvePlateState(raw);

    if (raw.length >= maxRawLength && /[A-Za-z0-9]/u.test(event.key)) {
      event.preventDefault();
    }
  }

  private updateDomValue(
    inputEl: HTMLInputElement,
    formatted: string,
    rawPlate: string,
    spec: PlateStateSpec,
    triggerEvent?: Event
  ): void {
    inputEl.maxLength = spec.maxFormattedLength;

    if (inputEl.value !== formatted) {
      inputEl.value = formatted;
      this.rawPlateChange.emit(rawPlate);

      if (!triggerEvent) {
        inputEl.dispatchEvent(new Event("input", { bubbles: true }));
      }
    }
  }

  private updateCaretPosition(
    inputEl: HTMLInputElement,
    formatted: string,
    rawCharsBeforeCursor: number
  ): void {
    const newCaretPos = PlateMaskDirective.calculateCaretPosition(
      formatted,
      rawCharsBeforeCursor
    );
    inputEl.setSelectionRange(newCaretPos, newCaretPos);
  }

  private emitCountryChange(
    effectiveCountry: PlateCountry,
    triggerEvent?: Event
  ): void {
    if (Boolean(triggerEvent) || this.lastEmittedCountry !== effectiveCountry) {
      this.lastEmittedCountry = effectiveCountry;
      this.countryChange.emit(effectiveCountry);
    }
  }

  private resolvePlateState(raw: string): PlateStateSpec {
    const mode = this.country();
    const country =
      mode === "UNPLATED" ? "UNPLATED" : resolvePlatedCountry(raw, mode);
    return PLATE_STATE_MACHINE[country];
  }

  private handleDelimiterBackspace(
    raw: string,
    rawCharsBeforeCursor: number
  ): DelimiterBackspaceResult {
    if (!this.isDeletingDelimiter) {
      return { updatedCaretCount: rawCharsBeforeCursor, updatedRaw: raw };
    }
    this.isDeletingDelimiter = false;
    let updatedRaw = raw;
    let updatedCaretCount = rawCharsBeforeCursor;
    if (raw.length === this.lastRawValue.length && rawCharsBeforeCursor > 0) {
      updatedRaw =
        raw.slice(0, rawCharsBeforeCursor - 1) +
        raw.slice(rawCharsBeforeCursor);
    }
    if (rawCharsBeforeCursor > 0) {
      updatedCaretCount -= 1;
    }
    return { updatedCaretCount, updatedRaw };
  }

  private static calculateCaretPosition(
    formatted: string,
    rawCharsBeforeCursor: number
  ): number {
    let countedRaw = 0;
    for (let i = 0; i < formatted.length; i += 1) {
      if (countedRaw === rawCharsBeforeCursor) {
        return i;
      }
      if (/[A-Za-z0-9]/u.test(formatted[i])) {
        countedRaw += 1;
      }
    }
    return formatted.length;
  }
}
