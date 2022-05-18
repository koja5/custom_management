import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsReminderComponent } from './sms-reminder.component';

describe('SmsReminderComponent', () => {
  let component: SmsReminderComponent;
  let fixture: ComponentFixture<SmsReminderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmsReminderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
