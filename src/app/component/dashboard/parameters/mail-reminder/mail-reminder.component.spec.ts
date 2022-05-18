import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailReminderComponent } from './mail-reminder.component';

describe('MailReminderComponent', () => {
  let component: MailReminderComponent;
  let fixture: ComponentFixture<MailReminderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailReminderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailReminderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
