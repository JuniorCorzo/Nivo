import { provideLocationMocks } from "@angular/common/testing";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter, type ActivatedRoute } from "@angular/router";
import type { PublicTicketModel } from "@core/models/public-ticket.model";
import { PublicTicketService } from "@core/services/public-ticket.service";
import { of, throwError } from "rxjs";

import { PublicTicketPageComponent } from "./public-ticket-page";

describe("PublicTicketPageComponent", () => {
  let component: PublicTicketPageComponent;
  let fixture: ComponentFixture<PublicTicketPageComponent>;
  let publicTicketServiceMock: {
    getPublicTicket: ReturnType<typeof vi.fn>;
  };

  const mockTicket: PublicTicketModel = {
    entryTime: "2026-10-14T01:00:00Z",
    id: "uuid-ticket-1",
    parkingLotName: "Parqueadero Bolívar",
    photoUrl: "data:image/jpeg;base64,mockphoto",
    plate: "SP-1042",
    plateCountry: "UNPLATED",
    rateName: "Tarifa Motos",
    ratePricePerUnit: 2000,
    rateTimeUnit: "HOURS",
    slotNumber: "M-04",
    status: "OPEN",
  };

  beforeEach(async () => {
    publicTicketServiceMock = {
      getPublicTicket: vi.fn().mockReturnValue(of(mockTicket)),
    };

    await TestBed.configureTestingModule({
      imports: [PublicTicketPageComponent],
      providers: [
        provideRouter([]),
        provideLocationMocks(),
        {
          provide: PublicTicketService,
          useValue: publicTicketServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicTicketPageComponent);
    component = fixture.componentInstance;
  });

  it("should create PublicTicketPageComponent", () => {
    expect(component).toBeTruthy();
  });

  it("should load ticket and update signals when id param is present", async () => {
    fixture.componentRef.setInput("id", "uuid-ticket-1");
    fixture.detectChanges();
    await fixture.whenStable();

    expect(publicTicketServiceMock.getPublicTicket).toHaveBeenCalledWith(
      "uuid-ticket-1"
    );
    expect(component.ticket()).toEqual(mockTicket);
    expect(component.isLoading()).toBe(false);
    expect(component.hasError()).toBe(false);
  });

  it("should handle error state when ticket is not found", async () => {
    publicTicketServiceMock.getPublicTicket.mockReturnValue(
      throwError(() => new Error("Not Found"))
    );

    fixture.componentRef.setInput("id", "non-existent-id");
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.hasError()).toBe(true);
    expect(component.isLoading()).toBe(false);
    expect(component.ticket()).toBeNull();
  });

  it("should format elapsed seconds into HH:MM:SS", () => {
    expect(PublicTicketPageComponent.formatElapsed(3665)).toBe("01:01:05");
    expect(PublicTicketPageComponent.formatElapsed(60)).toBe("00:01:00");
    expect(PublicTicketPageComponent.formatElapsed(0)).toBe("00:00:00");
  });

  it("should calculate estimated fee correctly for hourly rate", () => {
    // 3665 seconds is > 1 hour -> 2 billed hours * $2000 = $4000
    const fee = PublicTicketPageComponent.calculateEstimatedFee(3665, 2000, "HOURS");
    expect(fee).toBe(4000);

    // 1800 seconds is <= 1 hour -> 1 billed hour * $2000 = $2000
    const feeFirstHour = PublicTicketPageComponent.calculateEstimatedFee(1800, 2000, "HOURS");
    expect(feeFirstHour).toBe(2000);
  });

  it("should generate SVG qrDataUrl when ticket is successfully loaded", async () => {
    fixture.componentRef.setInput("id", "uuid-ticket-1");
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise((r) => setTimeout(r, 50));
    fixture.detectChanges();

    expect(component.qrDataUrl()).toBeTruthy();
    expect(component.qrDataUrl()).toContain("data:image/svg+xml");
  });

  it("should increment elapsed seconds reactively with live timer interval", async () => {
    vi.useFakeTimers();
    try {
      const entryTime = new Date(Date.now() - 60000).toISOString(); // 1 minute ago
      const ticketWithRecentEntry: PublicTicketModel = {
        ...mockTicket,
        entryTime,
      };
      publicTicketServiceMock.getPublicTicket.mockReturnValue(
        of(ticketWithRecentEntry)
      );

      fixture.componentRef.setInput("id", "uuid-timer-test");
      fixture.detectChanges();

      const initialElapsed = component.elapsedSeconds();
      expect(initialElapsed).toBeGreaterThanOrEqual(60);

      vi.advanceTimersByTime(3000);
      expect(component.elapsedSeconds()).toBe(initialElapsed + 3);
    } finally {
      vi.useRealTimers();
    }
  });
});
