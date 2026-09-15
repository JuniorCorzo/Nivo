import { OverlayContainer } from "@angular/cdk/overlay";
import { Component } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideIcons } from "@ng-icons/core";
import { lucideEllipsis, lucidePencil, lucideTrash2 } from "@ng-icons/lucide";

import { MeatballMenu } from "./meatball-menu";
import type { MeatballMenuItem } from "./meatball-menu";

@Component({
  imports: [MeatballMenu],
  template: `
    <app-meatball-menu [items]="items">
      <div data-testid="projected-content">Custom Projected Content</div>
    </app-meatball-menu>
  `,
})
class TestHostComponent {
  items: MeatballMenuItem[] = [
    {
      action: vi.fn(),
      label: "Custom Item",
    },
  ];
}

describe("MeatballMenu", () => {
  let component: MeatballMenu;
  let fixture: ComponentFixture<MeatballMenu>;
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeatballMenu],
      providers: [
        provideIcons({
          lucideEllipsis,
          lucidePencil,
          lucideTrash2,
        }),
      ],
    }).compileComponents();

    overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();

    fixture = TestBed.createComponent(MeatballMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have accessibility attributes on trigger button", () => {
    const trigger = fixture.nativeElement.querySelector("nv-button");
    expect(trigger).toBeTruthy();
    expect(trigger?.getAttribute("aria-haspopup")).toBe("menu");
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
    expect(trigger?.getAttribute("aria-label")).toBe("Más opciones");
  });

  it("should allow customizing ariaLabel, variant, and size inputs", async () => {
    fixture.componentRef.setInput("ariaLabel", "Opciones adicionales");
    fixture.componentRef.setInput("variant", "ghost");
    fixture.componentRef.setInput("size", "sm");
    fixture.detectChanges();
    await fixture.whenStable();

    const trigger = fixture.nativeElement.querySelector("nv-button");
    expect(trigger?.getAttribute("aria-label")).toBe("Opciones adicionales");
    expect(component.variant()).toBe("ghost");
    expect(component.size()).toBe("sm");
  });

  it("should toggle isOpen and update aria-expanded on trigger click", async () => {
    const trigger = fixture.nativeElement.querySelector("nv-button");
    expect(component.isOpen()).toBe(false);

    trigger?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isOpen()).toBe(true);
    expect(trigger?.getAttribute("aria-expanded")).toBe("true");

    trigger?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isOpen()).toBe(false);
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  });

  it("should open overlay and display menu items when items input is provided", async () => {
    const editAction = vi.fn();
    const deleteAction = vi.fn();
    const items: MeatballMenuItem[] = [
      {
        action: editAction,
        icon: "lucidePencil",
        label: "Editar",
      },
      {
        action: deleteAction,
        icon: "lucideTrash2",
        label: "Eliminar",
        variant: "destructive",
      },
    ];

    fixture.componentRef.setInput("items", items);
    fixture.detectChanges();

    component.open();
    fixture.detectChanges();
    await fixture.whenStable();

    const menu = overlayContainerElement.querySelector('[role="menu"]');
    expect(menu).toBeTruthy();

    const menuItems = overlayContainerElement.querySelectorAll<HTMLButtonElement>(
      '[role="menuitem"]'
    );
    expect(menuItems.length).toBe(2);
    expect(menuItems[0]?.textContent).toContain("Editar");
    expect(menuItems[1]?.textContent).toContain("Eliminar");
    expect(menuItems[1]?.classList.contains("text-destructive")).toBe(true);

    menuItems[0]?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(editAction).toHaveBeenCalledTimes(1);
    expect(component.isOpen()).toBe(false);
  });

  it("should not execute action if item is disabled", async () => {
    const disabledAction = vi.fn();
    const items: MeatballMenuItem[] = [
      {
        action: disabledAction,
        disabled: true,
        label: "Deshabilitado",
      },
    ];

    fixture.componentRef.setInput("items", items);
    fixture.detectChanges();

    component.open();
    fixture.detectChanges();
    await fixture.whenStable();

    const itemBtn = overlayContainerElement.querySelector<HTMLButtonElement>(
      '[role="menuitem"]'
    );
    expect(itemBtn?.disabled).toBe(true);

    itemBtn?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(disabledAction).not.toHaveBeenCalled();
  });

  it("should close menu on Escape keydown", async () => {
    component.open();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isOpen()).toBe(true);
    expect(overlayContainerElement.querySelector('[role="menu"]')).toBeTruthy();

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isOpen()).toBe(false);
    expect(overlayContainerElement.querySelector('[role="menu"]')).toBeNull();
  });

  it("should close menu on outside click or close() call", async () => {
    component.open();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isOpen()).toBe(true);

    component.close();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.isOpen()).toBe(false);
  });

  it("should project ng-content inside menu overlay", async () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    // SAFETY: Host template declares app-meatball-menu as the sole child component
    const menuComponent = hostFixture.debugElement.children[0]
      .componentInstance as MeatballMenu;
    menuComponent.open();
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const projected = overlayContainerElement.querySelector(
      '[data-testid="projected-content"]'
    );
    expect(projected).toBeTruthy();
    expect(projected?.textContent).toContain("Custom Projected Content");
  });
});
