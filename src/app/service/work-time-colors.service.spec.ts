import { TestBed } from '@angular/core/testing';

import { WorkTimeColorsService } from './work-time-colors.service';

describe('WorkTimeColorsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WorkTimeColorsService = TestBed.get(WorkTimeColorsService);
    expect(service).toBeTruthy();
  });
});
