import { Directive } from '@angular/core';

@Directive({
  selector: '[appTimeMask]',
  standalone: true,
  host: {
    '(input)': 'onInput($event)',
  },
})
export class TimeMask {
  private isFormatting = false;

  onInput(event: Event): void {
    if (this.isFormatting) {
      return;
    }

    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 4) {
      value = value.substring(0, 4);
    }

    if (value.charAt(0) !== '' && Number(value.charAt(0)) > 2) {
      input.value = '';
      return;
    }

    if (value.length >= 2 && value.charAt(0) === '2' && Number(value.charAt(1)) > 3) {
      value = value.charAt(0);
    }

    const hours = value.substring(0, 2);
    const minutes = value.substring(2, 4);

    const formatted = value.length < 2 ? hours : minutes ? `${hours}:${minutes}` : `${hours}:`;

    if (formatted === input.value) {
      return;
    }

    this.isFormatting = true;
    input.value = formatted;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    queueMicrotask(() => {
      this.isFormatting = false;
    });
  }
}
