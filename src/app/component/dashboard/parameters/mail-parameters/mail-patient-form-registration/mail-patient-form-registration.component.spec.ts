import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailPatientFormRegistrationComponent } from './mail-patient-form-registration.component';

describe('MailPatientFormRegistrationComponent', () => {
  let component: MailPatientFormRegistrationComponent;
  let fixture: ComponentFixture<MailPatientFormRegistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailPatientFormRegistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailPatientFormRegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
