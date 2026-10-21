import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { ModalComponent } from "./modal";
import type { ModalRole, ModalSize } from "./modal";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent],
  standalone: true,
  template: `
    <nv-modal
      [isOpen]="isOpen()"
      [size]="size()"
      [role]="role()"
      [closeOnBackdropClick]="closeOnBackdropClick()"
      [closeOnEsc]="closeOnEsc()"
      [titleId]="titleId()"
      [descriptionId]="descriptionId()"
      (closed)="onClosed()"
    >
      <div modal-header id="projected-header">Header Title</div>
      <div modal-body id="projected-body">Body Content</div>
      <div id="projected-default">Default Content</div>
      <div modal-footer id="projected-footer">Footer Action</div>
    </nv-modal>
  `,
})
class TestHostComponent {
  readonly isOpen = signal<boolean>(false);
  readonly size = signal<ModalSize>("md");
  readonly role = signal<ModalRole>("dialog");
  readonly closeOnBackdropClick = signal<boolean>(true);
  readonly closeOnEsc = signal<boolean>(true);
  readonly titleId = signal<string | undefined>("modal-title-id");
  readonly descriptionId = signal<string | undefined>("modal-desc-id");

  readonly closedEvents: number[] = [];

  onClosed(): void {
    this.closedEvents.push(Date.now());
  }
}

describe("ModalComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let element: HTMLElement;
  let dialogEl: HTMLDialogElement;

  beforeAll(() => {
    HTMLDialogElement.prototype.showModal = vi.fn(
      function mockShowModal(this: HTMLDialogElement) {
        this.open = true;
      }
    );
    HTMLDialogElement.prototype.close = vi.fn(
      function mockClose(this: HTMLDialogElement) {
        this.open = false;
      }
    );
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    /* SAFETY: Test fixture nativeElement is an HTMLElement */
    element = fixture.nativeElement as HTMLElement;
    /* SAFETY: Dialog inside nv-modal is HTMLDialogElement */
    dialogEl = element.querySelector("dialog") as HTMLDialogElement;
  });

  it("should render dialog closed by default", () => {
    expect(dialogEl).not.toBeNull();
    expect(dialogEl.open).toBe(false);
    expect(dialogEl.getAttribute("role")).toBe("dialog");
    expect(dialogEl.getAttribute("aria-modal")).toBe("true");
    expect(dialogEl.getAttribute("aria-labelledby")).toBe("modal-title-id");
    expect(dialogEl.getAttribute("aria-describedby")).toBe("modal-desc-id");
  });

  it("should open dialog when isOpen becomes true", () => {
    host.isOpen.set(true);
    fixture.detectChanges();

    expect(dialogEl.open).toBe(true);
  });

  it("should close dialog when isOpen changes from true to false", () => {
    host.isOpen.set(true);
    fixture.detectChanges();
    expect(dialogEl.open).toBe(true);

    host.isOpen.set(false);
    fixture.detectChanges();
    expect(dialogEl.open).toBe(false);
  });

  it("should map size classes correctly for each ModalSize", () => {
    expect(dialogEl.classList.contains("w-[min(100%-2rem,28rem)]")).toBe(true);

    host.size.set("sm");
    fixture.detectChanges();
    expect(dialogEl.classList.contains("w-[min(100%-2rem,24rem)]")).toBe(true);

    host.size.set("lg");
    fixture.detectChanges();
    expect(dialogEl.classList.contains("w-[min(100%-2rem,36rem)]")).toBe(true);

    host.size.set("xl");
    fixture.detectChanges();
    expect(dialogEl.classList.contains("w-[min(100%-2rem,48rem)]")).toBe(true);
  });

  it("should allow alertdialog role", () => {
    host.role.set("alertdialog");
    fixture.detectChanges();

    expect(dialogEl.getAttribute("role")).toBe("alertdialog");
  });

  it("should emit closed when clicking directly on the dialog (backdrop)", () => {
    host.isOpen.set(true);
    fixture.detectChanges();

    dialogEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(host.closedEvents.length).toBe(1);
  });

  it("should NOT emit closed on backdrop click when closeOnBackdropClick is false", () => {
    host.isOpen.set(true);
    host.closeOnBackdropClick.set(false);
    fixture.detectChanges();

    dialogEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(host.closedEvents.length).toBe(0);
  });

  it("should NOT emit closed when clicking inside the modal content card", () => {
    host.isOpen.set(true);
    fixture.detectChanges();

    const header = element.querySelector("#projected-header");
    expect(header).not.toBeNull();

    header?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

    expect(host.closedEvents.length).toBe(0);
  });

  it("should emit closed on cancel event (Esc) when closeOnEsc is true", () => {
    host.isOpen.set(true);
    fixture.detectChanges();

    const cancelEvent = new Event("cancel", { cancelable: true });
    dialogEl.dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(host.closedEvents.length).toBe(1);
  });

  it("should preventDefault but NOT emit closed on cancel event when closeOnEsc is false", () => {
    host.isOpen.set(true);
    host.closeOnEsc.set(false);
    fixture.detectChanges();

    const cancelEvent = new Event("cancel", { cancelable: true });
    dialogEl.dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(host.closedEvents.length).toBe(0);
  });

  it("should project header, body, default, and footer content", () => {
    expect(element.querySelector("#projected-header")?.textContent).toBe(
      "Header Title"
    );
    expect(element.querySelector("#projected-body")?.textContent).toBe(
      "Body Content"
    );
    expect(element.querySelector("#projected-default")?.textContent).toBe(
      "Default Content"
    );
    expect(element.querySelector("#projected-footer")?.textContent).toBe(
      "Footer Action"
    );
  });

  it("should close dialog on ngOnDestroy if open", () => {
    host.isOpen.set(true);
    fixture.detectChanges();
    expect(dialogEl.open).toBe(true);

    fixture.destroy();
    expect(dialogEl.open).toBe(false);
  });
});
