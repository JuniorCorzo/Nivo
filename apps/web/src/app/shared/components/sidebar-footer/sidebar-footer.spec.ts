import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { UserService } from '@core/services/user/user-service';

import { SidebarFooter } from './sidebar-footer';

describe('SidebarFooter', () => {
  let component: SidebarFooter;
  let fixture: ComponentFixture<SidebarFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarFooter],
      providers: [
        provideRouter([]),
        {
          provide: UserService,
          useValue: { currentUser: signal(null) },
        },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarFooter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
