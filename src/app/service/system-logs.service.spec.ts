import { TestBed } from '@angular/core/testing';

import { SystemLogsService } from './system-logs.service';

describe('SystemLogsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SystemLogsService = TestBed.get(SystemLogsService);
    expect(service).toBeTruthy();
  });
});
