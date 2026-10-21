import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block scroll-m-20 text-3xl font-bold tracking-tight text-foreground font-sans",
  },
  selector: "nv-h1",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyH1 {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block scroll-m-20 text-2xl font-semibold tracking-tight text-foreground font-sans",
  },
  selector: "nv-h2",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyH2 {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block scroll-m-20 text-xl font-semibold tracking-tight text-foreground font-sans",
  },
  selector: "nv-h3",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyH3 {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block scroll-m-20 text-lg font-semibold tracking-tight text-foreground font-sans",
  },
  selector: "nv-h4",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyH4 {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block scroll-m-20 text-base font-semibold tracking-tight text-foreground font-sans",
  },
  selector: "nv-h5",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyH5 {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block scroll-m-20 text-sm font-semibold tracking-tight text-foreground font-sans",
  },
  selector: "nv-h6",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyH6 {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block leading-7 text-[var(--foreground)] font-sans",
  },
  selector: "nv-p",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyP {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "text-sm text-[var(--foreground)] font-sans",
  },
  selector: "nv-span",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographySpan {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "text-sm text-[var(--muted-foreground)] font-sans",
  },
  selector: "nv-muted",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyMuted {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "font-mono text-sm text-[var(--foreground)]",
  },
  selector: "nv-mono",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyMono {}
