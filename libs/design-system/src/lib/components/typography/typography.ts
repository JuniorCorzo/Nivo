import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      "block scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl font-sans",
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
      "block scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 font-sans",
  },
  selector: "nv-h2",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyH2 {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block scroll-m-20 text-2xl font-semibold tracking-tight font-sans",
  },
  selector: "nv-h3",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyH3 {}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "block scroll-m-20 text-xl font-semibold tracking-tight font-sans",
  },
  selector: "nv-h4",
  standalone: true,
  template: `<ng-content />`,
})
export class TypographyH4 {}

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
