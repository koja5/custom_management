import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RightOfWithdrawalComponent } from './right-of-withdrawal.component';

describe('RightOfWithdrawalComponent', () => {
  let component: RightOfWithdrawalComponent;
  let fixture: ComponentFixture<RightOfWithdrawalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RightOfWithdrawalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RightOfWithdrawalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
