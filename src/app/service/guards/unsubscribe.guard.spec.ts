import { TestBed, inject } from '@angular/core/testing';
import { UnsubscribeGuard } from './unsubscribe.guard';

describe('UnsubscribeGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UnsubscribeGuard]
    });
  });

  it('should ...', inject([UnsubscribeGuard], (guard: UnsubscribeGuard) => {
    expect(guard).toBeTruthy();
  }));
});
