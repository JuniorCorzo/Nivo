import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import type { ParkingLotListItemModel } from "@core/models/parking.model";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { PageHeaderComponent } from "@shared/components/page-header/page-header";
import { APP_ROUTES } from "@shared/constants/app-routes.constant";

import { ParkingSlotFormFacade } from "../../facades/parking-slot-form.facade";
import { ParkingSlotFormPage } from "./parking-slot-form";

const mockParking: ParkingLotListItemModel = {
  address: { city: "", country: "", state: "", street: "", zipCode: "" },
  coordinates: { latitude: 0, longitude: 0 },
  createdAt: "",
  currency: "COP",
  id: "parking-123",
  name: "Sede Norte",
  occuppationRate: 0,
  ownerName: "Admin",
  slotDistribution: [],
  totalCapacity: 10,
  updatedAt: "",
};

describe("ParkingSlotFormPage", () => {
  let fixture: ComponentFixture<ParkingSlotFormPage>;
  let component: ParkingSlotFormPage;

  const mockFacade = {
    conflictMessage: signal<string | null>(null),
    description: signal("Configurá la generación masiva de plazas"),
    editWarning: signal<string | null>(null),
    form: {
      from: signal(1),
      hasCharger: signal(false),
      isAccessible: signal(false),
      isActive: signal(true),
      number: signal(""),
      prefix: signal("A"),
      status: signal("AVAILABLE"),
      to: signal(10),
      type: signal("CAR"),
      zone: signal("Norte"),
    },
    isBlocked: signal(false),
    isNumberLocked: signal(false),
    isTypeLocked: signal(false),
    mode: signal<"create" | "edit">("create"),
    parking: signal<ParkingLotListItemModel | null>(mockParking),
    parkingId: signal("parking-123"),
    previewCount: signal(10),
    previewRange: signal("A-001 ... A-010"),
    submit: vi.fn(),
    title: signal("Crear plazas"),
  };

  beforeEach(async () => {
    mockFacade.mode.set("create");
    mockFacade.title.set("Crear plazas");
    mockFacade.description.set("Configurá la generación masiva de plazas");

    await TestBed.configureTestingModule({
      imports: [ParkingSlotFormPage],
      providers: [
        provideRouter([]),
        {
          provide: ActiveParkingService,
          useValue: { activeParkingName: signal("") },
        },
      ],
    })
      .overrideComponent(ParkingSlotFormPage, {
        set: {
          providers: [{ provide: ParkingSlotFormFacade, useValue: mockFacade }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(ParkingSlotFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create the page", () => {
    expect(component).toBeTruthy();
  });

  it("should render app-page-header with title, subtitle, icon, and breadcrumbs", () => {
    const headerDebugEl = fixture.debugElement.query(
      By.directive(PageHeaderComponent)
    );
    expect(headerDebugEl).toBeTruthy();

    // SAFETY: Querying component instance of PageHeaderComponent
    const headerInstance =
      headerDebugEl.componentInstance as PageHeaderComponent;
    expect(headerInstance.title()).toBe("Crear plazas");
    expect(headerInstance.subtitle()).toBe(
      "Configurá la generación masiva de plazas"
    );
    expect(headerInstance.icon()).toBe("lucideLayers");
    expect(headerInstance.breadcrumbs()).toEqual([
      {
        icon: "lucideParkingSquare",
        label: "Parqueaderos",
        url: APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: "Sede Norte",
        url: APP_ROUTES.app.parkingLotSlots("parking-123"),
      },
      { icon: "lucidePlus", label: "Crear plazas" },
    ]);
  });

  it("should project back button into [actions] slot of page-header", () => {
    const headerDebugEl = fixture.debugElement.query(
      By.directive(PageHeaderComponent)
    );
    const actionsSlot = headerDebugEl.nativeElement.querySelector(
      '[data-testid="page-header-actions"]'
    );
    expect(actionsSlot).toBeTruthy();
    expect(actionsSlot.textContent).toContain("Volver al listado");
  });

  it("should compute breadcrumbs for edit mode", () => {
    mockFacade.mode.set("edit");
    fixture.detectChanges();

    expect(component.breadcrumbs()).toEqual([
      {
        icon: "lucideParkingSquare",
        label: "Parqueaderos",
        url: APP_ROUTES.app.parkingLots,
      },
      {
        icon: "lucideBuilding2",
        isParking: true,
        label: "Sede Norte",
        url: APP_ROUTES.app.parkingLotSlots("parking-123"),
      },
      { icon: "lucideEdit", label: "Editar plaza" },
    ]);
  });
});
