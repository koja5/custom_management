import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailResetPasswordComponent } from './mail-reset-password.component';

describe('MailResetPasswordComponent', () => {
  let component: MailResetPasswordComponent;
  let fixture: ComponentFixture<MailResetPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailResetPasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
