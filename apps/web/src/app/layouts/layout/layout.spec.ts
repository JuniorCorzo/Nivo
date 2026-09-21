import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";

import { LayoutComponent } from "./layout";

describe("LayoutComponent", () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render main container with responsive shell classes", () => {
    const mainEl = fixture.debugElement.query(By.css("main"));
    expect(mainEl).toBeTruthy();
    expect(mainEl.nativeElement.classList.contains("flex")).toBe(true);
    expect(mainEl.nativeElement.classList.contains("min-h-dvh")).toBe(true);
    expect(mainEl.nativeElement.classList.contains("flex-col")).toBe(true);
    expect(mainEl.nativeElement.classList.contains("md:flex-row")).toBe(true);
  });

  it("should render named sidebar router-outlet with max-w-sm class", () => {
    const sidebarOutlet = fixture.debugElement.query(
      By.css("router-outlet[name='sidebar']")
    );
    expect(sidebarOutlet).toBeTruthy();
    expect(sidebarOutlet.nativeElement.classList.contains("max-w-sm")).toBe(
      true
    );
  });

  it("should render primary router-outlet inside section container", () => {
    const sectionEl = fixture.debugElement.query(By.css("main > section"));
    expect(sectionEl).toBeTruthy();
    expect(sectionEl.nativeElement.classList.contains("min-w-0")).toBe(true);
    expect(sectionEl.nativeElement.classList.contains("flex-1")).toBe(true);
    expect(sectionEl.nativeElement.classList.contains("overflow-hidden")).toBe(
      true
    );

    const primaryOutlet = sectionEl.query(By.css("router-outlet:not([name])"));
    expect(primaryOutlet).toBeTruthy();
  });
});
