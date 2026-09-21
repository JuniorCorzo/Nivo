import { signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { AuthService } from "@core/services/auth-service";
import { UserService } from "@core/services/user/user-service";

import { SidebarFooter } from "./sidebar-footer";

describe("SidebarFooter", () => {
  let component: SidebarFooter;
  let fixture: ComponentFixture<SidebarFooter>;

  const mockAuthService = {
    logout: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarFooter],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: { currentUser: signal(null) },
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render app-user-menu in the footer", () => {
    const userMenu = fixture.debugElement.query(By.css("app-user-menu"));
    expect(userMenu).toBeTruthy();
  });

  it("should not render separate theme or logout buttons directly in footer", () => {
    // Only app-user-menu should be a direct child in footer
    const footer = fixture.debugElement.query(By.css("footer"));
    const directThemeButton = footer.query(By.css(":scope > app-theme-button"));
    const directLogoutButton = footer.query(
      By.css(":scope > app-logout-button")
    );

    expect(directThemeButton).toBeNull();
    expect(directLogoutButton).toBeNull();
  });

  it("should pass collapsed input to app-user-menu", () => {
    fixture.componentRef.setInput("collapsed", true);
    fixture.detectChanges();

    const userMenu = fixture.debugElement.query(By.css("app-user-menu"));
    expect(userMenu.componentInstance.collapsed()).toBe(true);
  });
});
