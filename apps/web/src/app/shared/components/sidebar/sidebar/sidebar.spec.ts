import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { UserService } from '@core/services/user/user-service';

import { Sidebar } from './sidebar';

describe('Sidebar', () => {
  let component: Sidebar;
  let fixture: ComponentFixture<Sidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sidebar],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: { currentUser: signal(null) },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render horizontal logo when expanded', async () => {
    (component as any).collapsed.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const horizontalLogo = element.querySelector('ng-icon[name="nivo-logo-horizontal"]');
    const iconLogo = element.querySelector('ng-icon[name="nivo-logo-icon"]');

    expect(horizontalLogo).toBeTruthy();
    expect(iconLogo).toBeNull();
  });

  it('should render icon logo when collapsed', async () => {
    (component as any).collapsed.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    const element = fixture.nativeElement as HTMLElement;
    const horizontalLogo = element.querySelector('ng-icon[name="nivo-logo-horizontal"]');
    const iconLogo = element.querySelector('ng-icon[name="nivo-logo-icon"]');

    expect(horizontalLogo).toBeNull();
    expect(iconLogo).toBeTruthy();
  });

  it('should toggle collapsed state when toggle button is clicked', async () => {
    (component as any).collapsed.set(false);
    fixture.detectChanges();
    await fixture.whenStable();

    const button = fixture.nativeElement.querySelector(
      'button[aria-label="Colapsar sidebar"]',
    ) as HTMLButtonElement;
    expect(button).toBeTruthy();

    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect((component as any).collapsed()).toBeTrue();
    const expandButton = fixture.nativeElement.querySelector(
      'button[aria-label="Expandir sidebar"]',
    ) as HTMLButtonElement;
    expect(expandButton).toBeTruthy();
  });
});
