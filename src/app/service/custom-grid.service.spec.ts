import { TestBed } from '@angular/core/testing';

import { CustomGridService } from './custom-grid.service';

describe('CustomGridService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomGridService = TestBed.get(CustomGridService);
    expect(service).toBeTruthy();
  });
});
