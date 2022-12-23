import { TestBed } from '@angular/core/testing';

import { VersionInfoService } from './version-info.service';

describe('VersionInfoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VersionInfoService = TestBed.get(VersionInfoService);
    expect(service).toBeTruthy();
  });
});
