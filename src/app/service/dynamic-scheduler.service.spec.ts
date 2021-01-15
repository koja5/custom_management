import { TestBed } from '@angular/core/testing';

import { DynamicSchedulerService } from './dynamic-scheduler.service';

describe('DynamicSchedulerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DynamicSchedulerService = TestBed.get(DynamicSchedulerService);
    expect(service).toBeTruthy();
  });
});
