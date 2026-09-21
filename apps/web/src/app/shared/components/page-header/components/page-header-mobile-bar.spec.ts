import { Component } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { PageHeaderMobileBarComponent } from "./page-header-mobile-bar";

@Component({
  imports: [PageHeaderMobileBarComponent],
  standalone: true,
  template: `
    <app-page-header-mobile-bar [mobilePath]="'Parque / Lista'" [badge]="null">
      <span badge id="projected-mobile-badge">Custom Badge</span>
    </app-page-header-mobile-bar>
  `,
})
class TestHostComponent {
  readonly hostTitle = "Mobile Bar Host";
}

describe("PageHeaderMobileBarComponent", () => {
  let component: PageHeaderMobileBarComponent;
  let fixture: ComponentFixture<PageHeaderMobileBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderMobileBarComponent, TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderMobileBarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("mobilePath", "Inicio / Config");
    fixture.detectChanges();
  });

  it("should create PageHeaderMobileBarComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should render mobile path", () => {
    const pathEl = fixture.nativeElement.querySelector(
      '[data-testid="page-header-mobile-path"]'
    );
    expect(pathEl).toBeTruthy();
    expect(pathEl.textContent.trim()).toBe("Inicio / Config");
  });

  it("should render back button when isRoot is false and emit back on click", () => {
    fixture.componentRef.setInput("isRoot", false);
    fixture.detectChanges();

    const backSpy = vi.fn();
    component.back.subscribe(backSpy);

    const backBtn: HTMLButtonElement = fixture.nativeElement.querySelector(
      '[data-testid="page-header-mobile-back-btn"]'
    );
    expect(backBtn).toBeTruthy();

    backBtn.click();
    expect(backSpy).toHaveBeenCalledTimes(1);
  });

  it("should not render back button when isRoot is true", () => {
    fixture.componentRef.setInput("isRoot", true);
    fixture.detectChanges();

    const backBtn = fixture.nativeElement.querySelector(
      '[data-testid="page-header-mobile-back-btn"]'
    );
    expect(backBtn).toBeNull();
  });

  it("should render badge when badge input is provided", () => {
    fixture.componentRef.setInput("badge", "Activo");
    fixture.componentRef.setInput("badgeVariant", "success");
    fixture.detectChanges();

    const badgeEl = fixture.nativeElement.querySelector("nv-badge");
    expect(badgeEl).toBeTruthy();
    expect(badgeEl.textContent.trim()).toBe("Activo");
  });

  it("should project badge slot when badge input is not provided", () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    const projected = hostFixture.nativeElement.querySelector(
      "#projected-mobile-badge"
    );
    expect(projected).toBeTruthy();
    expect(projected.textContent.trim()).toBe("Custom Badge");
  });

  it("should have @sm:hidden in host classes", () => {
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.classList.contains("@sm:hidden")).toBe(true);
    expect(hostEl.classList.contains("flex")).toBe(true);
  });
});
