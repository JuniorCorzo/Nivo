import { setTimeout as sleep } from "node:timers/promises";

import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { TicketSummary } from "@core/models/ticket.model";

import { TicketReceiptComponent } from "./ticket-receipt";

describe("TicketReceiptComponent", () => {
  let component: TicketReceiptComponent;
  let fixture: ComponentFixture<TicketReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketReceiptComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketReceiptComponent);
    component = fixture.componentInstance;
  });

  it("should create ticket receipt component", () => {
    expect(component).toBeTruthy();
  });

  it("should emit closed output when onClose is called", () => {
    const emitSpy = vi.spyOn(component.closed, "emit");
    component.onClose();
    expect(emitSpy).toHaveBeenCalled();
  });

  it("should format date correctly", () => {
    const formatted = component.formatDate("2026-08-27T10:30:00.000Z");
    expect(formatted).not.toBe("---");
  });

  it("should compute public ticket url based on ticket id", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-12345",
      licensePlate: "SP-1001",
      plateCountry: "UNPLATED",
      status: "OPEN",
    };

    fixture.componentRef.setInput("ticket", mockTicket);
    fixture.detectChanges();

    expect(component.publicUrl()).toContain("/t/ticket-12345");
  });

  it("should render ticket-delivery-card inside receipt", () => {
    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("ticket", {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-12345",
      licensePlate: "ABC123",
      status: "OPEN",
    });
    fixture.detectChanges();

    const deliveryCard = fixture.nativeElement.querySelector(
      "app-ticket-delivery-card"
    );
    expect(deliveryCard).not.toBeNull();
  });

  it("should generate qrDataUrl when ticket is present", async () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-qr-test",
      licensePlate: "SP-1002",
      status: "OPEN",
    };

    fixture.componentRef.setInput("ticket", mockTicket);
    fixture.detectChanges();
    await fixture.whenStable();
    await sleep(50);
    fixture.detectChanges();

    expect(component.qrDataUrl()).toBeTruthy();
    expect(component.qrDataUrl()).toContain("data:image/svg+xml");
  });

  it("should render vehicle photo thumbnail in DOM when photoUrl is present", () => {
    const mockTicketWithPhoto: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-photo-test",
      licensePlate: "SP-1003",
      photoUrl: "data:image/jpeg;base64,mockphotodata",
      status: "OPEN",
    };

    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("ticket", mockTicketWithPhoto);
    fixture.detectChanges();

    const imgEl: HTMLImageElement | null = fixture.nativeElement.querySelector(
      'img[alt="Foto del vehículo"]'
    );
    expect(imgEl).toBeTruthy();
    expect(imgEl?.src).toContain("data:image/jpeg;base64,mockphotodata");
  });

  it("should render ticket-delivery-card component when isOpen is true", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-resend-test",
      licensePlate: "RES123",
      phoneNumber: "3101112233",
      status: "OPEN",
    };

    fixture.componentRef.setInput("isOpen", true);
    fixture.componentRef.setInput("ticket", mockTicket);
    fixture.detectChanges();

    const deliveryCard = fixture.nativeElement.querySelector(
      "app-ticket-delivery-card"
    );
    expect(deliveryCard).toBeTruthy();

    const phoneInputEl: HTMLInputElement | null =
      fixture.nativeElement.querySelector("#delivery-phone-input");
    expect(phoneInputEl).toBeTruthy();
    expect(phoneInputEl?.value).toBe("3101112233");
  });
});
