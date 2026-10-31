import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { ParkingService } from "@core/services/parking-service";
import { TicketService } from "@core/services/ticket-service";
import { of } from "rxjs";

import { TicketsPageComponent } from "./tickets-page";

interface MockPageTicketService {
  calculatePrice: ReturnType<typeof vi.fn>;
  listTicketsByParkingLot: ReturnType<typeof vi.fn>;
  listTicketsByTenant: ReturnType<typeof vi.fn>;
}

describe("TicketsPageComponent", () => {
  let mockTicketService: MockPageTicketService;

  beforeEach(async () => {
    mockTicketService = {
      calculatePrice: vi.fn().mockReturnValue(of(null)),
      listTicketsByParkingLot: vi.fn().mockReturnValue(of([])),
      listTicketsByTenant: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [TicketsPageComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: vi.fn().mockReturnValue("p-123"),
              },
            },
          },
        },
        { provide: TicketService, useValue: mockTicketService },
        {
          provide: ParkingService,
          useValue: {
            parkingLots: signal([]),
          },
        },
      ],
    }).compileComponents();
  });

  it("should create and load tickets on init", () => {
    const fixture = TestBed.createComponent(TicketsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(mockTicketService.listTicketsByParkingLot).toHaveBeenCalledWith(
      "p-123"
    );
  });

  it("should load tenant tickets when parkingId param is not present", () => {
    const route = TestBed.inject(ActivatedRoute);
    vi.spyOn(route.snapshot.paramMap, "get").mockReturnValue(null);

    const fixture = TestBed.createComponent(TicketsPageComponent);
    fixture.detectChanges();

    expect(mockTicketService.listTicketsByTenant).toHaveBeenCalled();
  });

  it("should update filter when clicking Metric Ribbon cards", () => {
    const fixture = TestBed.createComponent(TicketsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const updateFiltersSpy = vi.spyOn(component.facade, "updateFilters");
    /* SAFETY: Querying nv-card elements rendered for metric ribbon */
    const cards = fixture.nativeElement.querySelectorAll(
      'nv-card[role="button"]'
    ) as NodeListOf<HTMLElement>;
    expect(cards.length).toBe(4);

    // Click Activos card (index 0)
    cards[0].click();
    expect(updateFiltersSpy).toHaveBeenCalledWith({ status: "OPEN" });

    // Click Mora card (index 1)
    cards[1].click();
    expect(updateFiltersSpy).toHaveBeenCalledWith({ status: "MORA" });

    // Click Cerrados card (index 2)
    cards[2].click();
    expect(updateFiltersSpy).toHaveBeenCalledWith({ status: "CLOSED" });

    // Click Total card (index 3)
    cards[3].click();
    expect(updateFiltersSpy).toHaveBeenCalledWith({ status: "ALL" });
  });

  it("should support keyboard navigation (Enter and Space) on Metric Ribbon cards", () => {
    const fixture = TestBed.createComponent(TicketsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const updateFiltersSpy = vi.spyOn(component.facade, "updateFilters");
    /* SAFETY: Querying nv-card elements rendered for metric ribbon */
    const cards = fixture.nativeElement.querySelectorAll(
      'nv-card[role="button"]'
    ) as NodeListOf<HTMLElement>;

    cards[0].dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
    );
    expect(updateFiltersSpy).toHaveBeenCalledWith({ status: "OPEN" });

    cards[1].dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: " " })
    );
    expect(updateFiltersSpy).toHaveBeenCalledWith({ status: "MORA" });

    cards[2].dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: "Enter" })
    );
    expect(updateFiltersSpy).toHaveBeenCalledWith({ status: "CLOSED" });

    cards[3].dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, key: " " })
    );
    expect(updateFiltersSpy).toHaveBeenCalledWith({ status: "ALL" });
  });

  it("should update vehicle filter when clicking vehicle filter pills", () => {
    const fixture = TestBed.createComponent(TicketsPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const updateFiltersSpy = vi.spyOn(component.facade, "updateFilters");
    /* SAFETY: Elements queried from test fixture DOM */
    const pills = fixture.nativeElement.querySelectorAll(
      '[data-testid="vehicle-filter-pills"] button'
    ) as NodeListOf<HTMLButtonElement>;
    expect(pills.length).toBe(3);

    // Click Carros pill (index 1)
    pills[1].click();
    expect(updateFiltersSpy).toHaveBeenCalledWith({ vehicleType: "CAR" });

    // Click Motos pill (index 2)
    pills[2].click();
    expect(updateFiltersSpy).toHaveBeenCalledWith({
      vehicleType: "MOTORCYCLE",
    });

    // Click Todos pill (index 0)
    pills[0].click();
    expect(updateFiltersSpy).toHaveBeenCalledWith({ vehicleType: "ALL" });
  });
});
