import { Component, computed, effect, ElementRef, input, viewChild } from '@angular/core';

@Component({
  selector: 'app-occuppation-meter',
  imports: [],
  templateUrl: './occuppation-meter.html',
  styleUrl: './occuppation-meter.css',
})
export class OccuppationMeter {
  public id = input('occuppation-meter');
  public min = input('0');
  public max = input('');
  public value = input('');
  public low = input('33');
  public optimum = input('70');
  public high = input('90');

  protected ratio = computed(() => Math.round((Number(this.value()) * 100) / Number(this.max())));
  private occuppationMeter = viewChild<ElementRef>('occuppation_meter');

  constructor() {
    effect(() => {
      this.occuppationMeter()?.nativeElement.style.setProperty('--bar-width', `${this.ratio()}%`);
      this.occuppationMeter()?.nativeElement.style.setProperty(
        '--bar-background',
        this.getBarBackground(),
      );
    });
  }
  private getBarBackground() {
    const ratio = this.ratio();
    console.log(ratio);
    switch (true) {
      case ratio > parseInt(this.optimum()) && ratio < parseInt(this.high()):
        return 'var(--color-warning)';
      case ratio > parseInt(this.high()):
        return 'var(--color-error)';
      default:
        return 'var(--color-success)';
    }
  }
}
