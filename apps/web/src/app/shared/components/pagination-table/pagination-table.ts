import { Component, input } from "@angular/core";
import { NgIcon } from "@ng-icons/core";

@Component({
  imports: [NgIcon],
  selector: "app-pagination-table",
  styleUrl: "./pagination-table.css",
  templateUrl: "./pagination-table.html",
})
export class PaginationTable {
  currentItems = input.required<number>();
  countItems = input.required<number>();
  currentPage = input.required<number>();
  countPages = input.required<number>();

  getCanPreviousPage = input.required<boolean>();
  previousPage = input.required<() => void>();

  getCanNextPage = input.required<boolean>();
  nextPage = input.required<() => void>();
}
