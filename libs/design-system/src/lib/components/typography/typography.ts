import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy,
} from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-h1",
  standalone: true,
  template: `<h1 [class]="classes()"><ng-content /></h1>`,
})
export class TypographyH1 {
  readonly class = input<string>("");

  readonly classes = computed(() => {
    const base =
      "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl font-sans";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-h2",
  standalone: true,
  template: `<h2 [class]="classes()"><ng-content /></h2>`,
})
export class TypographyH2 {
  readonly class = input<string>("");

  readonly classes = computed(() => {
    const base =
      "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 font-sans";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-h3",
  standalone: true,
  template: `<h3 [class]="classes()"><ng-content /></h3>`,
})
export class TypographyH3 {
  readonly class = input<string>("");

  readonly classes = computed(() => {
    const base = "scroll-m-20 text-2xl font-semibold tracking-tight font-sans";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-h4",
  standalone: true,
  template: `<h4 [class]="classes()"><ng-content /></h4>`,
})
export class TypographyH4 {
  readonly class = input<string>("");

  readonly classes = computed(() => {
    const base = "scroll-m-20 text-xl font-semibold tracking-tight font-sans";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-p",
  standalone: true,
  template: `<p [class]="classes()"><ng-content /></p>`,
})
export class TypographyP {
  readonly class = input<string>("");

  readonly classes = computed(() => {
    const base = "leading-7 text-[var(--foreground)] font-sans";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-span",
  standalone: true,
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class TypographySpan {
  readonly class = input<string>("");

  readonly classes = computed(() => {
    const base = "text-sm text-[var(--foreground)] font-sans";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-muted",
  standalone: true,
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class TypographyMuted {
  readonly class = input<string>("");

  readonly classes = computed(() => {
    const base = "text-sm text-[var(--muted-foreground)] font-sans";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: "nv-mono",
  standalone: true,
  template: `<code [class]="classes()"><ng-content /></code>`,
})
export class TypographyMono {
  readonly class = input<string>("");

  readonly classes = computed(() => {
    const base = "font-mono text-sm text-[var(--foreground)]";
    return this.class() ? `${base} ${this.class()}` : base;
  });
}
