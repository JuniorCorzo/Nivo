import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { TicketSummary } from "@core/models/ticket.model";

import { setTimeout as sleep } from "node:timers/promises";

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

  it("should compute whatsapp link with Colombian country code 57 and encoded message", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-12345",
      licensePlate: "SP-1001",
      phoneNumber: "3158492014",
      plateCountry: "UNPLATED",
      status: "OPEN",
    };

    fixture.componentRef.setInput("ticket", mockTicket);
    fixture.detectChanges();

    const link = component.whatsAppLink();
    expect(link).toContain("https://wa.me/573158492014?text=");
    expect(link).toContain(encodeURIComponent("SP-1001"));
  });

  it("should compute generic whatsapp share link when phone number is missing", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-12345",
      licensePlate: "ABC123",
      plateCountry: "CO",
      status: "OPEN",
    };

    fixture.componentRef.setInput("ticket", mockTicket);
    fixture.detectChanges();

    const link = component.whatsAppLink();
    expect(link).toContain("https://wa.me/?text=");
    expect(link).toContain(encodeURIComponent("ABC123"));
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
      'img[alt="Foto del vehículo"]',
    );
    expect(imgEl).toBeTruthy();
    expect(imgEl?.src).toContain("data:image/jpeg;base64,mockphotodata");
  });
});
