import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MailPatientCreatedAccountComponent } from './mail-patient-created-account.component';

describe('MailPatientCreatedAccountComponent', () => {
  let component: MailPatientCreatedAccountComponent;
  let fixture: ComponentFixture<MailPatientCreatedAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MailPatientCreatedAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MailPatientCreatedAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
