import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-pagination-table',
  imports: [NgIcon],
  templateUrl: './pagination-table.html',
  styleUrl: './pagination-table.css',
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
