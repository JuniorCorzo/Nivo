import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { createColumnHelper } from "@tanstack/angular-table";

import { DataTableState } from "../state/data-table.state";
import { DataTableSearchComponent } from "./data-table-search";

interface Item {
  id: number;
  name: string;
}

@Component({
  imports: [DataTableSearchComponent],
  standalone: true,
  template: ` <app-data-table-search [table]="table" placeholder="Buscar elementos..." /> `,
})
class SearchTestHostComponent {
  readonly items = signal<Item[]>([
    { id: 1, name: "Apple" },
    { id: 2, name: "Banana" },
    { id: 3, name: "Cherry" },
  ]);

  private readonly columnHelper = createColumnHelper<Item>();
  readonly state = new DataTableState<Item>();

  readonly table = this.state.createTable({
    columns: [
      this.columnHelper.accessor("id", { header: "ID" }),
      this.columnHelper.accessor("name", { header: "Name" }),
    ],
    data: () => this.items(),
  });
}

describe("DataTableSearchComponent", () => {
  let fixture: ComponentFixture<SearchTestHostComponent>;
  let host: SearchTestHostComponent;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [SearchTestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchTestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should debounce global filter by 300ms", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const el = fixture.nativeElement as HTMLElement;
    /* SAFETY: Search input element exists in the template */
    const input = el.querySelector("input") as HTMLInputElement;

    input.value = "app";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    fixture.detectChanges();

    expect(host.table.getState().globalFilter).toBe("");

    vi.advanceTimersByTime(150);
    expect(host.table.getState().globalFilter).toBe("");

    vi.advanceTimersByTime(150);
    fixture.detectChanges();
    expect(host.table.getState().globalFilter).toBe("app");
  });

  it("should clear search and global filter when clicking clear button", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const el = fixture.nativeElement as HTMLElement;
    /* SAFETY: Search input element exists in the template */
    const input = el.querySelector("input") as HTMLInputElement;

    input.value = "cherry";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(host.table.getState().globalFilter).toBe("cherry");

    /* SAFETY: Clear button exists in the template when search value is non-empty */
    const clearBtn = el.querySelector('[aria-label="Limpiar búsqueda"]') as HTMLElement;
    expect(clearBtn).toBeTruthy();
    clearBtn.click();
    fixture.detectChanges();

    expect(host.table.getState().globalFilter).toBe("");
  });
});
