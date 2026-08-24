import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginationTable } from './pagination-table';

describe('PaginationTable', () => {
  let component: PaginationTable;
  let fixture: ComponentFixture<PaginationTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationTable],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
