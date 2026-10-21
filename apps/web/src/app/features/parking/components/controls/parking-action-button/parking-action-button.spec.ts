import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideIcons } from "@ng-icons/core";
import {
  lucideCoins,
  lucideCopy,
  lucideEllipsis,
  lucideLogIn,
  lucideParkingSquare,
  lucidePencil,
  lucideTrash2,
} from "@ng-icons/lucide";
import { ToastService } from "@nivo-sass/design-system";

import { ParkingHomeFacade } from "../../../facades/parking-home.facade";
import { ParkingActionButton } from "./parking-action-button";

interface MockFacadeActions {
  activeParkingLot: ReturnType<
    typeof signal<{ id: string; name: string } | null>
  >;
  onDeleteClick: ReturnType<typeof vi.fn>;
  onEdit: ReturnType<typeof vi.fn>;
  onManageOperations: ReturnType<typeof vi.fn>;
  onManageRates: ReturnType<typeof vi.fn>;
  onManageSlots: ReturnType<typeof vi.fn>;
}

interface MockToastService {
  showToast: ReturnType<typeof vi.fn>;
}

describe("ParkingActionButton", () => {
  let component: ParkingActionButton;
  let fixture: ComponentFixture<ParkingActionButton>;
  let mockFacade: MockFacadeActions;
  let mockToastService: MockToastService;

  beforeEach(async () => {
    mockFacade = {
      activeParkingLot: signal({ id: "lot-123", name: "Central" }),
      onDeleteClick: vi.fn(),
      onEdit: vi.fn(),
      onManageOperations: vi.fn(),
      onManageRates: vi.fn(),
      onManageSlots: vi.fn(),
    };

    mockToastService = {
      showToast: vi.fn(),
    };

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockImplementation(async () => {}),
      },
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [ParkingActionButton],
      providers: [
        { provide: ParkingHomeFacade, useValue: mockFacade },
        { provide: ToastService, useValue: mockToastService },
        provideIcons({
          lucideCoins,
          lucideCopy,
          lucideEllipsis,
          lucideLogIn,
          lucideParkingSquare,
          lucidePencil,
          lucideTrash2,
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParkingActionButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should call onManageOperations when clicking Operaciones en vivo button", () => {
    const buttons = [...fixture.nativeElement.querySelectorAll("nv-button")];
    const liveOpBtn = buttons.find((btn) =>
      btn.textContent?.includes("Operaciones en vivo")
    );

    expect(liveOpBtn).toBeTruthy();
    liveOpBtn?.click();
    expect(mockFacade.onManageOperations).toHaveBeenCalledTimes(1);
  });

  it("should call onManageRates when clicking Tarifas button", () => {
    const buttons = [...fixture.nativeElement.querySelectorAll("nv-button")];
    const ratesBtn = buttons.find((btn) =>
      btn.textContent?.includes("Tarifas")
    );

    expect(ratesBtn).toBeTruthy();
    ratesBtn?.click();
    expect(mockFacade.onManageRates).toHaveBeenCalledTimes(1);
  });

  it("should call onManageSlots when clicking Plazas button", () => {
    const buttons = [...fixture.nativeElement.querySelectorAll("nv-button")];
    const slotsBtn = buttons.find((btn) => btn.textContent?.includes("Plazas"));

    expect(slotsBtn).toBeTruthy();
    slotsBtn?.click();
    expect(mockFacade.onManageSlots).toHaveBeenCalledTimes(1);
  });

  it("should render meatball menu with copy ID, edit, and delete items", () => {
    const meatballMenu =
      fixture.nativeElement.querySelector("app-meatball-menu");
    expect(meatballMenu).toBeTruthy();

    expect(component.menuItems).toHaveLength(3);
    expect(component.menuItems[0]?.label).toBe("Copiar ID");
    expect(component.menuItems[0]?.icon).toBe("lucideCopy");
    expect(component.menuItems[1]?.label).toBe("Editar");
    expect(component.menuItems[1]?.icon).toBe("lucidePencil");
    expect(component.menuItems[2]?.label).toBe("Eliminar");
    expect(component.menuItems[2]?.icon).toBe("lucideTrash2");
    expect(component.menuItems[2]?.variant).toBe("destructive");

    component.menuItems[1]?.action?.();
    expect(mockFacade.onEdit).toHaveBeenCalledTimes(1);

    component.menuItems[2]?.action?.();
    expect(mockFacade.onDeleteClick).toHaveBeenCalledTimes(1);
  });

  it("should copy parking ID to clipboard and show toast when action is executed", () => {
    component.menuItems[0]?.action?.();

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("lot-123");
    expect(mockToastService.showToast).toHaveBeenCalledWith({
      message: "ID del parqueadero copiado al portapapeles",
      type: "success",
    });
  });
});
