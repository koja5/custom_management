import { TestBed } from '@angular/core/testing';

import { PackLanguageService } from './pack-language.service';

describe('PackLanguageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PackLanguageService = TestBed.get(PackLanguageService);
    expect(service).toBeTruthy();
  });
});
