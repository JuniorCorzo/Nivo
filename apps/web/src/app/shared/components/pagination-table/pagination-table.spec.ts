import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";

import { PaginationTable } from "./pagination-table";

describe("PaginationTable", () => {
  let component: PaginationTable;
  let fixture: ComponentFixture<PaginationTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationTable],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationTable);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("currentItems", 10);
    fixture.componentRef.setInput("countItems", 100);
    fixture.componentRef.setInput("currentPage", 1);
    fixture.componentRef.setInput("countPages", 10);
    fixture.componentRef.setInput("getCanPreviousPage", false);
    fixture.componentRef.setInput("previousPage", () => {});
    fixture.componentRef.setInput("getCanNextPage", true);
    fixture.componentRef.setInput("nextPage", () => {});
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
