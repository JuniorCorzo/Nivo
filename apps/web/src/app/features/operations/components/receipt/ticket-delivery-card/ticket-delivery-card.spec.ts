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

  it("should compute email link with mailto scheme and encoded subject", () => {
    const mockTicket: TicketSummary = {
      entryTime: "2026-08-27T10:00:00Z",
      id: "ticket-email-test",
      licensePlate: "EML123",
      status: "OPEN",
    };

    fixture.componentRef.setInput("ticket", mockTicket);
    fixture.componentRef.setInput(
      "publicUrl",
      "https://app.nivo.dev/t/ticket-email-test"
    );
    fixture.componentRef.setInput("initialEmail", "customer@example.com");
    fixture.detectChanges();

    expect(component.emailLink()).toContain("mailto:customer@example.com");
    expect(component.emailLink()).toContain("EML123");
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

  it("should emit emailChange when typing in email input", () => {
    let emittedEmail = "";
    component.emailChange.subscribe((val) => {
      emittedEmail = val;
    });

    fixture.componentRef.setInput("mode", "receipt");
    component.setChannel("EMAIL");
    fixture.detectChanges();

    const inputEl: HTMLInputElement | null =
      fixture.nativeElement.querySelector("#delivery-email-input");
    expect(inputEl).toBeTruthy();
    if (inputEl) {
      inputEl.value = "driver@example.com";
      inputEl.dispatchEvent(new Event("input"));
    }
    fixture.detectChanges();

    expect(emittedEmail).toBe("driver@example.com");
    expect(component.emailInput()).toBe("driver@example.com");
  });

  it("should render conditionally based on mode (checkin vs receipt)", () => {
    fixture.componentRef.setInput("mode", "checkin");
    fixture.detectChanges();

    const badge: HTMLElement | null = fixture.nativeElement.querySelector("nv-badge");
    expect(badge).toBeTruthy();
    expect(badge?.textContent).toContain(component.texts.optionalBadge);

    // In checkin mode, copy link button is not rendered
    const copyBtn = fixture.nativeElement.querySelector("#copy-link-btn");
    expect(copyBtn).toBeNull();

    // Switch to receipt mode
    fixture.componentRef.setInput("mode", "receipt");
    fixture.componentRef.setInput("publicUrl", "https://app.nivo.dev/t/test-mode");
    fixture.detectChanges();

    const updatedBadge = fixture.nativeElement.querySelector("nv-badge");
    expect(updatedBadge).toBeNull();
  });

  it("should copy public URL to clipboard in receipt mode and reset on destroy", async () => {
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

    // Trigger destroy to ensure onDestroy hook cleans up without error
    fixture.destroy();
  });
});
