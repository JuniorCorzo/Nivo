import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { PageHeaderHistoryComponent } from "./page-header-history";

describe("PageHeaderHistoryComponent", () => {
  let component: PageHeaderHistoryComponent;
  let fixture: ComponentFixture<PageHeaderHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create PageHeaderHistoryComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should render history container and back/forward buttons", () => {
    const container = fixture.nativeElement.querySelector(
      '[data-testid="page-header-history"]'
    );
    const backBtn = fixture.nativeElement.querySelector(
      '[data-testid="page-header-back-btn"]'
    );
    const forwardBtn = fixture.nativeElement.querySelector(
      '[data-testid="page-header-forward-btn"]'
    );

    expect(container).toBeTruthy();
    expect(backBtn).toBeTruthy();
    expect(forwardBtn).toBeTruthy();
  });

  it("should emit back when back button is clicked", () => {
    const backSpy = vi.fn();
    component.back.subscribe(backSpy);

    const backBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="page-header-back-btn"]'
    );
    backBtn.click();

    expect(backSpy).toHaveBeenCalledTimes(1);
  });

  it("should emit forward when forward button is clicked", () => {
    const forwardSpy = vi.fn();
    component.forward.subscribe(forwardSpy);

    const forwardBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="page-header-forward-btn"]'
    );
    forwardBtn.click();

    expect(forwardSpy).toHaveBeenCalledTimes(1);
  });
});
