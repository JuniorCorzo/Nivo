import { OverlayContainer } from "@angular/cdk/overlay";
import { signal } from "@angular/core";
import type { WritableSignal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { Router, provideRouter } from "@angular/router";
import { ActiveParkingService } from "@core/services/active-parking.service";
import { AuthService } from "@core/services/auth-service";
import { ParkingService } from "@core/services/parking-service";
import { UserService } from "@core/services/user/user-service";

import { SidebarFooter } from "./sidebar-footer";

describe("SidebarFooter", () => {
  let component: SidebarFooter;
  let fixture: ComponentFixture<SidebarFooter>;
  let overlayContainer: OverlayContainer;
  let activeParkingLotSignal: WritableSignal<any>;
  let parkingLotsSignal: WritableSignal<any[]>;
  let mockActiveParkingService: {
    activeParkingLot: WritableSignal<any>;
    activeParkingName: WritableSignal<string>;
    setActiveParking: ReturnType<typeof vi.fn>;
  };
  let mockParkingService: {
    parkingLots: WritableSignal<any[]>;
  };

  const mockAuthService = {
    logout: vi.fn(),
  };

  beforeEach(async () => {
    activeParkingLotSignal = signal(null);
    parkingLotsSignal = signal([]);
    mockActiveParkingService = {
      activeParkingLot: activeParkingLotSignal,
      activeParkingName: signal(""),
      setActiveParking: vi.fn(),
    };
    mockParkingService = {
      parkingLots: parkingLotsSignal,
    };

    await TestBed.configureTestingModule({
      imports: [SidebarFooter],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: { currentUser: signal(null) },
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ActiveParkingService,
          useValue: mockActiveParkingService,
        },
        {
          provide: ParkingService,
          useValue: mockParkingService,
        },
      ],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    fixture = TestBed.createComponent(SidebarFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  afterEach(() => {
    overlayContainer?.ngOnDestroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render app-user-menu in the footer", () => {
    const userMenu = fixture.debugElement.query(By.css("app-user-menu"));
    expect(userMenu).toBeTruthy();
  });

  it("should not render separate theme or logout buttons directly in footer", () => {
    // Only app-user-menu should be a direct child in footer
    const footer = fixture.debugElement.query(By.css("footer"));
    const directThemeButton = footer.query(By.css(":scope > app-theme-button"));
    const directLogoutButton = footer.query(
      By.css(":scope > app-logout-button")
    );

    expect(directThemeButton).toBeNull();
    expect(directLogoutButton).toBeNull();
  });

  it("should pass collapsed input to app-user-menu", () => {
    fixture.componentRef.setInput("collapsed", true);
    fixture.detectChanges();

    const userMenu = fixture.debugElement.query(By.css("app-user-menu"));
    expect(userMenu.componentInstance.collapsed()).toBe(true);
  });

  it("should render Sede card with fallback text when no active lot", () => {
    fixture.detectChanges();
    const sedeButton = fixture.debugElement.query(
      By.css("button[cdkOverlayOrigin]")
    );
    expect(sedeButton).toBeTruthy();
    expect(sedeButton.nativeElement.textContent).toContain("Seleccionar sede");
    expect(sedeButton.nativeElement.textContent).toContain("Sin sede");
  });

  it("should render building icon in Sede card when collapsed", () => {
    fixture.componentRef.setInput("collapsed", true);
    fixture.detectChanges();

    const buildingIcon = fixture.debugElement.query(
      By.css("button[cdkOverlayOrigin] ng-icon[name='lucideBuilding2']")
    );
    expect(buildingIcon).toBeTruthy();
  });

  it("should render active parking name and capacity label when active lot is set", () => {
    activeParkingLotSignal.set({
      id: "lot-1",
      name: "Unicentro Norte",
      totalCapacity: 50,
    });
    fixture.detectChanges();

    const sedeButton = fixture.debugElement.query(
      By.css("button[cdkOverlayOrigin]")
    );
    expect(sedeButton.nativeElement.textContent).toContain("Unicentro Norte");
    expect(sedeButton.nativeElement.textContent).toContain("50 Plazas");
  });

  it("should toggle popover open state when clicking Sede button", () => {
    fixture.detectChanges();
    expect(component.isOpen()).toBe(false);

    const sedeButton = fixture.debugElement.query(
      By.css("button[cdkOverlayOrigin]")
    );
    sedeButton.nativeElement.click();
    fixture.detectChanges();

    expect(component.isOpen()).toBe(true);

    component.close();
    expect(component.isOpen()).toBe(false);
  });

  it("should select parking lot and close popover", () => {
    const lot = { id: "lot-2", name: "Parqueadero Centro", totalCapacity: 80 };
    parkingLotsSignal.set([lot]);
    fixture.detectChanges();

    component.selectParkingLot(lot as any);

    expect(mockActiveParkingService.setActiveParking).toHaveBeenCalledWith(lot);
    expect(component.isOpen()).toBe(false);
  });

  it("should navigate to corresponding lot URL when current URL is under a parking lot", () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, "navigateByUrl")
      .mockResolvedValue(true);
    Object.defineProperty(router, "url", {
      configurable: true,
      value: "/app/parking-lots/lot-1/rates",
    });

    const lot = { id: "lot-2", name: "Parqueadero Centro", totalCapacity: 80 };
    component.selectParkingLot(lot as any);

    expect(navigateSpy).toHaveBeenCalledWith("/app/parking-lots/lot-2/rates");
  });

  it("should navigate to lot detail when on /app/parking-lots/:id", () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, "navigateByUrl")
      .mockResolvedValue(true);
    Object.defineProperty(router, "url", {
      configurable: true,
      value: "/app/parking-lots/lot-1",
    });

    const lot = { id: "lot-2", name: "Parqueadero Centro", totalCapacity: 80 };
    component.selectParkingLot(lot as any);

    expect(navigateSpy).toHaveBeenCalledWith("/app/parking-lots/lot-2");
  });

  it("should not navigate when on dashboard", () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi
      .spyOn(router, "navigateByUrl")
      .mockResolvedValue(true);
    Object.defineProperty(router, "url", {
      configurable: true,
      value: "/app/dashboard",
    });

    const lot = { id: "lot-2", name: "Parqueadero Centro", totalCapacity: 80 };
    component.selectParkingLot(lot as any);

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  describe("formatAddress", () => {
    it("should render formatted street and city when address object is present", () => {
      const lotWithFullAddress = {
        id: "lot-1",
        name: "Sede Centro",
        address: { street: "Cra 10 #20-30", city: "Bogotá" },
        totalCapacity: 50,
      };
      expect(component.formatAddress(lotWithFullAddress as any)).toBe(
        "Cra 10 #20-30, Bogotá"
      );

      const lotWithStreetOnly = {
        id: "lot-2",
        name: "Sede Norte",
        address: { street: "Av Siempre Viva 742", city: "" },
        totalCapacity: 30,
      };
      expect(component.formatAddress(lotWithStreetOnly as any)).toBe(
        "Av Siempre Viva 742"
      );

      const lotWithStringAddress = {
        id: "lot-3",
        name: "Sede Sur",
        address: "Calle 100",
        totalCapacity: 20,
      };
      expect(component.formatAddress(lotWithStringAddress as any)).toBe(
        "Calle 100"
      );
    });

    it("should fall back to totalCapacity Plazas when address is missing or empty", () => {
      const lotWithEmptyAddress = {
        id: "lot-1",
        name: "Sede Centro",
        address: { street: "", city: "" },
        totalCapacity: 45,
      };
      expect(component.formatAddress(lotWithEmptyAddress as any)).toBe(
        "45 Plazas"
      );

      const lotWithNoAddress = {
        id: "lot-2",
        name: "Sede Norte",
        totalCapacity: 30,
      };
      expect(component.formatAddress(lotWithNoAddress as any)).toBe(
        "30 Plazas"
      );

      const lotWithNoCapacity = {
        id: "lot-3",
        name: "Sede Sur",
      };
      expect(component.formatAddress(lotWithNoCapacity as any)).toBe(
        "0 Plazas"
      );

      expect(component.formatAddress(null as any)).toBe("");
    });

    it("should render formatted address in popover and NOT [object Object]", () => {
      const lot = {
        id: "lot-1",
        name: "Sede Centro",
        address: { street: "Cra 7 # 12-34", city: "Medellín" },
        totalCapacity: 100,
      };
      parkingLotsSignal.set([lot]);
      component.isOpen.set(true);
      fixture.detectChanges();

      const overlay = document.querySelector(".cdk-overlay-container");
      expect(overlay).toBeTruthy();
      expect(overlay?.textContent).toContain("Cra 7 # 12-34, Medellín");
      expect(overlay?.textContent).not.toContain("[object Object]");
    });
  });
});
