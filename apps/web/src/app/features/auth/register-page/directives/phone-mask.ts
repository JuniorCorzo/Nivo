import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appPhoneMask]',
  host: {
    '(input)': 'onInput($event)',
  },
})
export class PhoneMask {
  constructor() {}

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 10) {
      value = value.substring(0, 10);
    }

    if (value.charAt(0) !== '3') {
      input.value = '';
      return;
    }

    const start = value.substring(0, 3);
    const end = value.substring(3, 10);

    input.value = end ? `${start}-${end}` : start;
  }
}
