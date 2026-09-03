import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-card",
  standalone: true,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
})
export class CardComponent {
  readonly class = input<string>("");
  readonly classes = computed(() =>
    `rounded-lg border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] shadow-sm ${this.class()}`.trim()
  );
}
