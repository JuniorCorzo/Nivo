import { TestBed } from "@angular/core/testing";
import { Title } from "@angular/platform-browser";
import type { RouterStateSnapshot } from "@angular/router";
import { describe, expect, it, vi } from "vitest";

import { AppTitleStrategy } from "./app-title-strategy";

describe("AppTitleStrategy", () => {
  let titleStrategy: AppTitleStrategy;
  let titleService: Title;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AppTitleStrategy, Title],
    });
    titleStrategy = TestBed.inject(AppTitleStrategy);
    titleService = TestBed.inject(Title);
  });

  it("should set title with suffix when title is provided", () => {
    vi.spyOn(titleStrategy, "buildTitle").mockReturnValue("Parqueaderos");
    const setTitleSpy = vi.spyOn(titleService, "setTitle");

    titleStrategy.updateTitle({} as RouterStateSnapshot);

    expect(setTitleSpy).toHaveBeenCalledWith("Parqueaderos - Nivo");
  });

  it("should set title to default when title is not provided", () => {
    vi.spyOn(titleStrategy, "buildTitle").mockReturnValue(undefined);
    const setTitleSpy = vi.spyOn(titleService, "setTitle");

    titleStrategy.updateTitle({} as RouterStateSnapshot);

    expect(setTitleSpy).toHaveBeenCalledWith("Nivo");
  });
});
