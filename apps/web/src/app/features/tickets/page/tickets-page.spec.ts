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
});
