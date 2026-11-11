import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import type { TicketSummary } from "@core/models/ticket.model";

import { TicketDeliveryCardComponent } from "./ticket-delivery-card";

describe("TicketDeliveryCardComponent", () => {
  let component: TicketDeliveryCardComponent;
  let fixture: ComponentFixture<TicketDeliveryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketDeliveryCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketDeliveryCardComponent);
    component = fixture.componentInstance;
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should switch channel between WHATSAPP and EMAIL", () => {
    let emittedChannel: string | null = null;
    component.channelChange.subscribe((ch) => {
      emittedChannel = ch;
    });

    expect(component.activeChannel()).toBe("WHATSAPP");

    component.setChannel("EMAIL");
    expect(component.activeChannel()).toBe("EMAIL");
    expect(emittedChannel).toBe("EMAIL");
  });

  it("should compute whatsapp link with Colombian prefix 57", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-whatsapp-test",
      licensePlate: "WAP123",
      phoneNumber: "3112223344",
      status: "OPEN",
    };

    fixture.componentRef.setInput("ticket", mockTicket);
    fixture.componentRef.setInput(
      "publicUrl",
      "https://app.nivo.dev/t/ticket-whatsapp-test"
    );
    fixture.detectChanges();

    expect(component.whatsAppLink()).toContain("573112223344");
    expect(component.whatsAppLink()).toContain("WAP123");
  });

  it("should emit phoneChange when typing in phone input", () => {
    let emittedPhone = "";
    component.phoneChange.subscribe((val) => {
      emittedPhone = val;
    });

    fixture.componentRef.setInput("mode", "receipt");
    fixture.detectChanges();

    const inputEl: HTMLInputElement | null =
      fixture.nativeElement.querySelector("#delivery-phone-input");
    expect(inputEl).toBeTruthy();
    if (inputEl) {
      inputEl.value = "3001234567";
      inputEl.dispatchEvent(new Event("input"));
    }
    fixture.detectChanges();

    expect(emittedPhone).toBe("3001234567");
    expect(component.phoneInput()).toBe("3001234567");
  });

  it("should copy public URL to clipboard in receipt mode", async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(null);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: writeTextSpy,
      },
    });

    fixture.componentRef.setInput("mode", "receipt");
    fixture.componentRef.setInput("publicUrl", "https://app.nivo.dev/t/test-1");
    fixture.detectChanges();

    await component.copyPublicUrl();

    expect(writeTextSpy).toHaveBeenCalledWith("https://app.nivo.dev/t/test-1");
    expect(component.isCopied()).toBe(true);
  });
});
