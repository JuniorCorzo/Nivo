/* eslint-disable promise/avoid-new, promise/prefer-await-to-callbacks */
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { ThemeButton } from "./theme-button";

interface TransitionDocument {
  startViewTransition?: (callback?: () => void) => {
    finished: Promise<void>;
  };
}

describe("ThemeButton", () => {
  let component: ThemeButton;
  let fixture: ComponentFixture<ThemeButton>;
  let originalStartViewTransition:
    | typeof document.startViewTransition
    | undefined;

  beforeEach(async () => {
    originalStartViewTransition = document.startViewTransition;

    await TestBed.configureTestingModule({
      imports: [ThemeButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    if (originalStartViewTransition === undefined) {
      Reflect.deleteProperty(document, "startViewTransition");
    } else {
      document.startViewTransition = originalStartViewTransition;
    }
    document.documentElement.classList.remove(
      "theme-transition",
      "light",
      "dark"
    );
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should add theme-transition class when startViewTransition is supported and remove it on finish", async () => {
    let resolveFinished!: () => void;
    const finishedPromise = new Promise<void>((resolve) => {
      resolveFinished = resolve;
    });

    const mockTransition = {
      finished: finishedPromise,
      ready: Promise.resolve(),
      skipTransition: vi.fn(),
      updateCallbackDone: Promise.resolve(),
    };

    const startViewTransitionSpy = vi.fn((callback?: () => void) => {
      callback?.();
      return mockTransition;
    });

    /* SAFETY: Document is cast to TransitionDocument to assign the mock transition function */
    (document as TransitionDocument).startViewTransition =
      startViewTransitionSpy;

    /* SAFETY: Fixture native element contains a button element */
    const button = fixture.nativeElement.querySelector(
      "button"
    ) as HTMLButtonElement;
    button.click();

    expect(startViewTransitionSpy).toHaveBeenCalledTimes(1);
    expect(
      document.documentElement.classList.contains("theme-transition")
    ).toBe(true);

    resolveFinished();
    await finishedPromise;
    await Promise.resolve();

    expect(
      document.documentElement.classList.contains("theme-transition")
    ).toBe(false);
  });

  it("should execute toggleTheme directly without adding theme-transition class when startViewTransition is not supported", () => {
    Reflect.deleteProperty(document, "startViewTransition");

    /* SAFETY: Fixture native element contains a button element */
    const button = fixture.nativeElement.querySelector(
      "button"
    ) as HTMLButtonElement;
    button.click();

    expect(
      document.documentElement.classList.contains("theme-transition")
    ).toBe(false);
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });
});
