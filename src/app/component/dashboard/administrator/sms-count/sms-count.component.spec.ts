import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsCountComponent } from './sms-count.component';

describe('SmsCountComponent', () => {
  let component: SmsCountComponent;
  let fixture: ComponentFixture<SmsCountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmsCountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
