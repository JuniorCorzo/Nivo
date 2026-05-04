import { TestBed } from '@angular/core/testing';

import { ColombiaService } from './colombia-service';

describe('ColombiaService', () => {
  let service: ColombiaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColombiaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
