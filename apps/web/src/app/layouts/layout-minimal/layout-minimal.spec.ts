import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutMinimal } from './layout-minimal';

describe('LayoutMinimal', () => {
  let component: LayoutMinimal;
  let fixture: ComponentFixture<LayoutMinimal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutMinimal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutMinimal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
