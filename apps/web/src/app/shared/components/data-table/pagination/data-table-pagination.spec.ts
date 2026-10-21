import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { createColumnHelper } from "@tanstack/angular-table";

import { DataTableState } from "../state/data-table.state";
import { DataTablePaginationComponent } from "./data-table-pagination";

interface Item {
  id: number;
  name: string;
}

@Component({
  imports: [DataTablePaginationComponent],
  standalone: true,
  template: ` <app-data-table-pagination [table]="table" [pageSizeOptions]="[5, 10, 20]" /> `,
})
class PaginationTestHostComponent {
  readonly items = signal<Item[]>(
    Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` })),
  );

  private readonly columnHelper = createColumnHelper<Item>();
  readonly state = new DataTableState<Item>();

  readonly table = this.state.createTable({
    columns: [
      this.columnHelper.accessor("id", { header: "ID" }),
      this.columnHelper.accessor("name", { header: "Name" }),
    ],
    data: () => this.items(),
  });

  constructor() {
    this.table.setPageSize(5);
  }
}

describe("DataTablePaginationComponent", () => {
  let fixture: ComponentFixture<PaginationTestHostComponent>;
  let host: PaginationTestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationTestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should display total items and page numbers", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain("Total: 25 resultados");
    expect(el.textContent).toContain("Página 1 de 5");
  });

  it("should navigate to next and previous pages", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const el = fixture.nativeElement as HTMLElement;
    /* SAFETY: Next page button exists in the pagination component */
    const nextBtn = el.querySelector('[aria-label="Página siguiente"]') as HTMLElement;
    expect(nextBtn).toBeTruthy();
    nextBtn.click();
    fixture.detectChanges();

    expect(host.table.getState().pagination.pageIndex).toBe(1);
    expect(el.textContent).toContain("Página 2 de 5");

    /* SAFETY: Previous page button exists in the pagination component */
    const prevBtn = el.querySelector('[aria-label="Página anterior"]') as HTMLElement;
    prevBtn.click();
    fixture.detectChanges();

    expect(host.table.getState().pagination.pageIndex).toBe(0);
    expect(el.textContent).toContain("Página 1 de 5");
  });

  it("should navigate to first and last pages", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const el = fixture.nativeElement as HTMLElement;
    /* SAFETY: Last page button exists in the pagination component */
    const lastBtn = el.querySelector('[aria-label="Última página"]') as HTMLElement;
    lastBtn.click();
    fixture.detectChanges();

    expect(host.table.getState().pagination.pageIndex).toBe(4);
    expect(el.textContent).toContain("Página 5 de 5");

    /* SAFETY: First page button exists in the pagination component */
    const firstBtn = el.querySelector('[aria-label="Primera página"]') as HTMLElement;
    firstBtn.click();
    fixture.detectChanges();

    expect(host.table.getState().pagination.pageIndex).toBe(0);
    expect(el.textContent).toContain("Página 1 de 5");
  });
});
