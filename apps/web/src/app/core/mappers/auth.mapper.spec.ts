import { TestBed } from '@angular/core/testing';

import { AuthMapper } from './auth.mapper';

describe('AuthMapper', () => {
  let service: AuthMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthMapper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
