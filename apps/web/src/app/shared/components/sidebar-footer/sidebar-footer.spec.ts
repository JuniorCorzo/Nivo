import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SidebarFooter } from './sidebar-footer';

describe('SidebarFooter', () => {
  let component: SidebarFooter;
  let fixture: ComponentFixture<SidebarFooter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarFooter],
      providers: [provideRouter([])],
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
