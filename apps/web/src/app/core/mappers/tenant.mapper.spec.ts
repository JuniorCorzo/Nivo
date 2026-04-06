import { TestBed } from '@angular/core/testing';

import { TenantMapper } from './tenant.mapper';

describe('TenantMapper', () => {
  let service: TenantMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TenantMapper);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
