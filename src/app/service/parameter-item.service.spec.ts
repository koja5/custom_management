import { TestBed } from '@angular/core/testing';

import { ParameterItemService } from './parameter-item.service';

describe('ParameterItemService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ParameterItemService = TestBed.get(ParameterItemService);
    expect(service).toBeTruthy();
  });
});
