import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ColombiaUbicationsModel } from '../models/colombia-ubications.model';

@Injectable({
  providedIn: 'root',
})
export class ColombiaService {
  private httpClient = inject(HttpClient);
  private colombiaUbication = signal<ColombiaUbicationsModel[]>([]);
  public departaments = computed(() =>
    this.colombiaUbication().map(({ department }) => department),
  );

  constructor() {
    this.initColombiaUbication();
  }

  private initColombiaUbication() {
    this.httpClient
      .get<ColombiaUbicationsModel[]>('/assets/data/colombia.json')
      .subscribe((colombiaUbications) => {
        this.colombiaUbication.set(colombiaUbications);
      });
  }

  public getCitiesByDepartmentName(departmentName: string): string[] {
    return (
      this.colombiaUbication().find(({ department }) => department === departmentName)?.cities ?? []
    );
  }
}
