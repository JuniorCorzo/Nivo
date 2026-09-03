import { TestBed } from '@angular/core/testing';

import { ResponseMapper } from './response.mapper';

describe('ResponseMapper', () => {
  let service: ResponseMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponseMapper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
