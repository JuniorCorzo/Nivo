import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";

import { RegisterPage } from "./register-page";

describe("RegisterPage", () => {
  let component: RegisterPage;
  let fixture: ComponentFixture<RegisterPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("contactInfo validation", () => {
    it("should reject arbitrary text and passwords", () => {
      component["registerModel"].update((m) => ({
        ...m,
        contactInfo: "MySecurePassword123!",
      }));
      fixture.detectChanges();

      const contactField = component["registerForm"].contactInfo();
      expect(contactField.invalid()).toBe(true);
      expect(contactField.errors()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            message: "Ingresa un número de contacto válido",
          }),
        ])
      );
    });

    it("should accept valid phone numbers", () => {
      const validNumbers = [
        "+57 300 123 4567",
        "+1-555-123-4567",
        "3001234567",
        "+573001234567",
      ];

      for (const phone of validNumbers) {
        component["registerModel"].update((m) => ({
          ...m,
          contactInfo: phone,
        }));
        fixture.detectChanges();

        const contactField = component["registerForm"].contactInfo();
        expect(contactField.invalid()).toBe(false);
      }
    });
  });
});
