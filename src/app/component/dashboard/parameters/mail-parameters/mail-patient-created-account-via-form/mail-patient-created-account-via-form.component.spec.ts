import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailPatientCreatedAccountViaFormComponent } from './mail-patient-created-account-via-form.component';

describe('MailPatientCreatedAccountViaFormComponent', () => {
  let component: MailPatientCreatedAccountViaFormComponent;
  let fixture: ComponentFixture<MailPatientCreatedAccountViaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailPatientCreatedAccountViaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailPatientCreatedAccountViaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
