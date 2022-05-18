import { TestBed } from '@angular/core/testing';

import { VaucherService } from './vaucher.service';

describe('VaucherService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VaucherService = TestBed.get(VaucherService);
    expect(service).toBeTruthy();
  });
});
