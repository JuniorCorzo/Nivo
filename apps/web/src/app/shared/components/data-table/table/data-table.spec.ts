import { Component, signal } from "@angular/core";
import type { ComponentFixture } from "@angular/core/testing";
import { TestBed } from "@angular/core/testing";
import { createColumnHelper } from "@tanstack/angular-table";

import { EmptyStateDirective } from "../directives/empty-state.directive";
import { DataTableState } from "../state/data-table.state";
import { DataTableComponent } from "./data-table";

interface SampleUser {
  email: string;
  id: string;
  name: string;
}

@Component({
  imports: [DataTableComponent, EmptyStateDirective],
  standalone: true,
  template: `
    <app-data-table
      [table]="table"
      [isLoading]="isLoading()"
      [rowClickable]="rowClickable()"
      [emptyMessage]="emptyMessage()"
      (rowClick)="onRowClick($event)"
    >
      @if (useCustomEmpty()) {
        <div emptyState data-testid="custom-empty">Estado vacío personalizado</div>
      }
    </app-data-table>
  `,
})
class TestHostComponent {
  readonly data = signal<SampleUser[]>([
    { email: "alice@example.com", id: "1", name: "Alice" },
    { email: "bob@example.com", id: "2", name: "Bob" },
  ]);
  readonly isLoading = signal(false);
  readonly rowClickable = signal(false);
  readonly emptyMessage = signal("No data found");
  readonly useCustomEmpty = signal(false);
  clickedRow: SampleUser | null = null;

  private readonly columnHelper = createColumnHelper<SampleUser>();
  readonly state = new DataTableState<SampleUser>();

  readonly table = this.state.createTable({
    columns: [
      this.columnHelper.accessor("name", {
        header: "Nombre",
        id: "name",
      }),
      this.columnHelper.accessor("email", {
        header: "Correo",
        id: "email",
      }),
    ],
    data: () => this.data(),
  });

  onRowClick(row: SampleUser): void {
    this.clickedRow = row;
  }
}

describe("DataTableComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should render table headers and rows", () => {
    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const element = fixture.nativeElement as HTMLElement;
    const headers = element.querySelectorAll("thead th");
    expect(headers.length).toBe(2);
    expect(headers[0].textContent).toContain("Nombre");
    expect(headers[1].textContent).toContain("Correo");

    const rows = element.querySelectorAll("tbody tr");
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain("Alice");
    expect(rows[0].textContent).toContain("alice@example.com");
    expect(rows[1].textContent).toContain("Bob");
  });

  it("should emit rowClick when rowClickable is true and row is clicked", () => {
    host.rowClickable.set(true);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const element = fixture.nativeElement as HTMLElement;
    /* SAFETY: First row element exists in rendered table */
    const firstRow = element.querySelector("tbody tr") as HTMLTableRowElement;
    expect(firstRow.classList.contains("cursor-pointer")).toBe(true);

    firstRow.click();
    expect(host.clickedRow).toEqual({
      email: "alice@example.com",
      id: "1",
      name: "Alice",
    });
  });

  it("should not emit rowClick when rowClickable is false", () => {
    host.rowClickable.set(false);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const element = fixture.nativeElement as HTMLElement;
    /* SAFETY: First row element exists in rendered table */
    const firstRow = element.querySelector("tbody tr") as HTMLTableRowElement;
    firstRow.click();
    expect(host.clickedRow).toBeNull();
  });

  it("should render skeleton rows when isLoading is true", () => {
    host.isLoading.set(true);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const element = fixture.nativeElement as HTMLElement;
    const pulseDivs = element.querySelectorAll(".animate-pulse");
    // 5 skeleton rows * 2 visible columns
    expect(pulseDivs.length).toBe(10);
  });

  it("should render default empty message when data is empty", () => {
    host.data.set([]);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain("No data found");
  });

  it("should render projected emptyState when provided", () => {
    host.data.set([]);
    host.useCustomEmpty.set(true);
    fixture.detectChanges();

    /* SAFETY: nativeElement is guaranteed to be an HTMLElement in test environment */
    const element = fixture.nativeElement as HTMLElement;
    const customEmpty = element.querySelector('[data-testid="custom-empty"]');
    expect(customEmpty).toBeTruthy();
    expect(customEmpty?.textContent).toContain("Estado vacío personalizado");
  });
});
