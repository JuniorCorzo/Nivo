import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { ParkingService } from "@core/services/parking-service";
import { provideIcons } from "@ng-icons/core";
import {
  lucideBuilding2,
  lucideCar,
  lucideChevronDown,
  lucideChevronRight,
  lucideHome,
  lucideParkingSquare,
} from "@ng-icons/lucide";

import { PageHeaderBreadcrumbsComponent } from "./page-header-breadcrumbs";

describe("PageHeaderBreadcrumbsComponent", () => {
  let component: PageHeaderBreadcrumbsComponent;
  let fixture: ComponentFixture<PageHeaderBreadcrumbsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageHeaderBreadcrumbsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActiveParkingService,
          useValue: {
            /* SAFETY: Mock object satisfies ParkingLotListItemModel for testing */
            activeParkingLot: signal<ParkingLotListItemModel | null>({
              id: "lot-1",
              name: "Sede Norte",
              occuppationRate: 45,
            } as ParkingLotListItemModel),
            activeParkingName: signal<string>("Sede Norte"),
          },
        },
        {
          provide: ParkingService,
          useValue: {
            parkingLots: signal<ParkingLotListItemModel[]>([]),
          },
        },
        provideIcons({
          lucideBuilding2,
          lucideCar,
          lucideChevronDown,
          lucideChevronRight,
          lucideHome,
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

    const nav = fixture.nativeElement.querySelector(
      '[data-testid="page-header-breadcrumb"]'
    );
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
      (s: unknown) => (s as HTMLElement).textContent?.trim() === "Ajustes"
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
    expect(icons.length).toBe(3);
  });

  it("should support all registered breadcrumb icons", () => {
    fixture.componentRef.setInput("breadcrumbs", [
      { icon: "lucideCoins", label: "Tarifas", url: "/rates" },
      { icon: "lucideLayoutGrid", label: "Plazas", url: "/slots" },
      { icon: "lucideTicket", label: "Tickets", url: "/tickets" },
      { icon: "lucidePlus", label: "Crear" },
    ]);
    fixture.detectChanges();

    const iconElements = fixture.nativeElement.querySelectorAll(
      '[data-testid="page-header-breadcrumb"] ng-icon'
    );
    // 4 item icons + 3 separator icons = 7
    expect(iconElements.length).toBe(7);
  });

  it("should render separator between breadcrumb items", () => {
    fixture.componentRef.setInput("breadcrumbs", [
      { label: "Item 1", url: "/1" },
      { label: "Item 2", url: "/2" },
      { label: "Item 3" },
    ]);
    fixture.detectChanges();

    const separators = fixture.nativeElement.querySelectorAll(
      'ng-icon[name="lucideChevronRight"]'
    );
    expect(separators.length).toBe(2);
  });

  it("should render breadcrumb links with icons for parking item without parking selector", () => {
    fixture.componentRef.setInput("breadcrumbs", [
      { icon: "lucideHome", label: "Home", url: "/app" },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: "Sede Norte",
        url: "/app/parking-lots",
      },
      { label: "Detalle" },
    ]);
    fixture.detectChanges();

    const selector = fixture.nativeElement.querySelector(
      "app-parking-lot-selector"
    );
    expect(selector).toBeNull();

    const links = fixture.nativeElement.querySelectorAll("a");
    expect(links.length).toBe(2);
    expect(links[0].textContent).toContain("Home");
    expect(links[1].textContent).toContain("Sede Norte");
  });
});
