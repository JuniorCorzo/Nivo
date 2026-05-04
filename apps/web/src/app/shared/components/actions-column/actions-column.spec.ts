import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsColumn } from './actions-column';

describe('ActionsColumn', () => {
  let component: ActionsColumn;
  let fixture: ComponentFixture<ActionsColumn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsColumn],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsColumn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
