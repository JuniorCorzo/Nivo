import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideIcons } from "@ng-icons/core";
import { lucideCar, lucideParkingSquare } from "@ng-icons/lucide";
import { PageHeaderBreadcrumbsComponent } from "./page-header-breadcrumbs.component";

describe("PageHeaderBreadcrumbsComponent", () => {
  let component: PageHeaderBreadcrumbsComponent;
  let fixture: ComponentFixture<PageHeaderBreadcrumbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderBreadcrumbsComponent],
      providers: [
        provideRouter([]),
        provideIcons({
          lucideCar,
          lucideParkingSquare,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageHeaderBreadcrumbsComponent);
    component = fixture.componentInstance;
  });

  it("should create PageHeaderBreadcrumbsComponent", () => {
    fixture.componentRef.setInput("breadcrumbs", []);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should render navigation with nav element and data-testid", () => {
    fixture.componentRef.setInput("breadcrumbs", [
      { label: "Inicio", url: "/app" },
      { label: "Detalle" },
    ]);
    fixture.detectChanges();

    const nav = fixture.nativeElement.querySelector('[data-testid="page-header-breadcrumb"]');
    expect(nav).toBeTruthy();
    expect(nav.getAttribute("aria-label")).toBe("Ruta de navegación");
  });

  it("should render links for items with url and span for items without url", () => {
    fixture.componentRef.setInput("breadcrumbs", [
      { label: "Dashboard", url: "/dashboard" },
      { label: "Ajustes" },
    ]);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector("a");
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/dashboard");
    expect(link.textContent).toContain("Dashboard");

    const spans = fixture.nativeElement.querySelectorAll("span");
    /* SAFETY: Querying span elements from fixture nativeElement guaranteed to be HTMLElement */
    const labelSpan = [...spans].find(
      (s: unknown) => (s as HTMLElement).textContent?.trim() === "Ajustes",
    );
    expect(labelSpan).toBeTruthy();
  });

  it("should render icons for breadcrumb items when present", () => {
    fixture.componentRef.setInput("breadcrumbs", [
      { icon: "lucideParkingSquare", label: "Parqueaderos", url: "/parking" },
      { icon: "lucideCar", label: "Vehículo" },
    ]);
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll("ng-icon");
    expect(icons.length).toBe(2);
  });

  it("should render separator > between breadcrumb items", () => {
    fixture.componentRef.setInput("breadcrumbs", [
      { label: "Item 1", url: "/1" },
      { label: "Item 2", url: "/2" },
      { label: "Item 3" },
    ]);
    fixture.detectChanges();

    const separators = fixture.nativeElement.querySelectorAll("span.text-border");
    expect(separators.length).toBe(2);
    expect(separators[0].textContent?.trim()).toBe(">");
    expect(separators[1].textContent?.trim()).toBe(">");
  });

  it("should render back link when backLink is provided and isRoot is false", () => {
    fixture.componentRef.setInput("breadcrumbs", [{ label: "Actual" }]);
    fixture.componentRef.setInput("backAriaLabel", "Regresar");
    fixture.componentRef.setInput("backLink", "/app/home");
    fixture.componentRef.setInput("isRoot", false);
    fixture.detectChanges();

    const backLink = fixture.nativeElement.querySelector('a[aria-label="Regresar"]');
    expect(backLink).toBeTruthy();
    expect(backLink.getAttribute("href")).toBe("/app/home");
    expect(backLink.textContent).toContain("Regresar");
  });
});
