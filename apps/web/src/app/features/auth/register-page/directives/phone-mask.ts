import { Directive } from "@angular/core";

@Directive({
  host: {
    "(input)": "onInput($event)",
  },
  selector: "[appPhoneMask]",
})
export class PhoneMask {
  static onInput(event: Event) {
    /* SAFETY: Event target of onInput on masked input is HTMLInputElement */
    const target = event.target as HTMLInputElement;
    let value = target.value.replaceAll(/\D/gu, "");

    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    if (value.charAt(0) !== "3") {
      target.value = "";
      return;
    }

    const start = value.slice(0, 3);
    const end = value.slice(3, 10);

    target.value = end ? `${start}-${end}` : start;
  }

  readonly onInput = PhoneMask.onInput;
}
